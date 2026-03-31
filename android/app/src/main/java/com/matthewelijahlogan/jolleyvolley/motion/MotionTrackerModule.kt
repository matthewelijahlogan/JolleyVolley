package com.matthewelijahlogan.jolleyvolley.motion

import android.graphics.Bitmap
import android.graphics.Color
import android.media.MediaMetadataRetriever
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import java.util.ArrayDeque
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

class MotionTrackerModule(private val appContext: ReactApplicationContext) : ReactContextBaseJavaModule(appContext) {

  private val executor = Executors.newSingleThreadExecutor()

  override fun getName(): String = "MotionTracker"

  @ReactMethod
  fun analyzeVideo(videoUri: String, promise: Promise) {
    executor.execute {
      try {
        val result = analyzeVideoInternal(videoUri)
        promise.resolve(result)
      } catch (error: Exception) {
        promise.reject("MOTION_TRACK_ERROR", error.message, error)
      }
    }
  }

  override fun invalidate() {
    super.invalidate()
    executor.shutdown()
  }

  private fun analyzeVideoInternal(videoUri: String) = Arguments.createMap().apply {
    val poseLandmarker = createPoseLandmarker()
    val retriever = MediaMetadataRetriever()

    try {
      retriever.setDataSource(appContext, Uri.parse(videoUri))
      val durationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()
        ?: throw IllegalStateException("Unable to read video duration.")
      val videoWidth = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toFloatOrNull() ?: 1080f
      val videoHeight = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toFloatOrNull() ?: 1920f
      val aspectRatio = if (videoHeight > 0f) videoWidth / videoHeight else 1f
      val videoFps = extractVideoFps(retriever, durationMs)

      val inferenceIntervalMs = determineInferenceInterval(durationMs)
      val rightSamples = mutableListOf<WristSample>()
      val leftSamples = mutableListOf<WristSample>()
      var processedFrames = 0

      for (timestampMs in 0L..durationMs step inferenceIntervalMs) {
        val frame = retriever.getFrameAtTime(timestampMs * 1000, MediaMetadataRetriever.OPTION_CLOSEST) ?: continue
        processedFrames += 1
        val argbFrame = if (frame.config == Bitmap.Config.ARGB_8888) frame else frame.copy(Bitmap.Config.ARGB_8888, false)
        val mpImage = BitmapImageBuilder(argbFrame).build()
        val result = poseLandmarker.detectForVideo(mpImage, timestampMs)
        val landmarks = result.landmarks().firstOrNull()

        if (landmarks != null && landmarks.size > RIGHT_ANKLE_INDEX) {
          buildSample(landmarks, timestampMs, true, aspectRatio)?.let { rightSamples.add(it) }
          buildSample(landmarks, timestampMs, false, aspectRatio)?.let { leftSamples.add(it) }
        }

        if (argbFrame != frame) {
          argbFrame.recycle()
        }
        frame.recycle()
      }

      val dominantHand = if (scoreHand(rightSamples) >= scoreHand(leftSamples)) "right" else "left"
      val selectedSamples = if (dominantHand == "right") rightSamples else leftSamples
      val smoothedSamples = smoothSamples(selectedSamples)
      val swingWindow = selectSwingWindow(smoothedSamples)

      if (swingWindow.size < 4) {
        throw IllegalStateException("Not enough visible hand samples were found in the selected clip.")
      }

      val contactSample = swingWindow.minByOrNull { it.y } ?: swingWindow.last()
      val hitchFrames = computeHitchFrames(swingWindow)
      val contactPoint = inferContactPoint(swingWindow)
      val quality = if (processedFrames > 0) selectedSamples.size.toFloat() / processedFrames.toFloat() else 0f
      val peakHandSpeedMph = computePeakHandSpeedMph(swingWindow, aspectRatio)
      val estimatedBallSpeedMph = estimateBallSpeedMph(peakHandSpeedMph, quality)
      val ballTracking = detectBallTrail(retriever, contactSample, swingWindow, aspectRatio, durationMs, inferenceIntervalMs)
      val detectedBallSpeedMph = computeBallSpeedMph(ballTracking.samples, aspectRatio, contactSample.shoulderSpan)
      val detectedBallTravelFeet = computeBallTravelFeet(ballTracking.samples, aspectRatio, contactSample.shoulderSpan)
      val ballTrackingQuality = computeBallTrackingQuality(ballTracking.samples, ballTracking.expectedFrames)
      val groundBaselineY = computeGroundBaselineY(smoothedSamples)
      val contactReachInches = computeReachHeightInches(contactSample, groundBaselineY)
      val verticalLeapInches = computeVerticalLeapInches(smoothedSamples, contactSample, groundBaselineY)
      val standingReachInches = max(0f, contactReachInches - verticalLeapInches)
      val landingStability = inferLandingStability(smoothedSamples, contactSample, aspectRatio)
      val releaseFrames = computeReleaseFrames(ballTracking.samples, contactSample, videoFps, inferenceIntervalMs)

      putString("dominantHand", dominantHand)
      putInt("processedFrames", processedFrames)
      putInt("trackedFrames", selectedSamples.size)
      putInt("hitchFrames", hitchFrames)
      putString("contactPoint", contactPoint)
      putString("landingStability", landingStability)
      putDouble("trackingQuality", quality.toDouble())
      putDouble("fps", videoFps.toDouble())
      putInt("releaseFrames", releaseFrames)
      putDouble("standingReachInches", standingReachInches.toDouble())
      putDouble("contactReachInches", contactReachInches.toDouble())
      putDouble("verticalLeapInches", verticalLeapInches.toDouble())
      putInt("inferenceIntervalMs", inferenceIntervalMs.toInt())
      putDouble("peakHandSpeedMph", peakHandSpeedMph.toDouble())
      putDouble("estimatedBallSpeedMph", estimatedBallSpeedMph.toDouble())
      putInt("ballTrackedFrames", ballTracking.samples.size)
      putDouble("ballTrackingQuality", ballTrackingQuality.toDouble())
      putDouble("detectedBallSpeedMph", detectedBallSpeedMph.toDouble())
      putDouble("detectedBallTravelFeet", detectedBallTravelFeet.toDouble())
      putArray("handTrail", createHandTrailArray(swingWindow))
      putArray("ballTrail", createBallTrailArray(ballTracking.samples))
    } finally {
      retriever.release()
      poseLandmarker.close()
    }
  }

  private fun createPoseLandmarker(): PoseLandmarker {
    val baseOptions = BaseOptions.builder()
      .setModelAssetPath("models/pose_landmarker_lite.task")
      .build()

    val options = PoseLandmarker.PoseLandmarkerOptions.builder()
      .setBaseOptions(baseOptions)
      .setRunningMode(RunningMode.VIDEO)
      .setMinPoseDetectionConfidence(0.35f)
      .setMinPosePresenceConfidence(0.35f)
      .setMinTrackingConfidence(0.35f)
      .build()

    return PoseLandmarker.createFromOptions(appContext, options)
  }

  private fun determineInferenceInterval(durationMs: Long): Long {
    return when {
      durationMs <= 1500L -> 33L
      durationMs <= 3500L -> 50L
      durationMs <= 7000L -> 66L
      else -> 80L
    }
  }

  private fun detectBallTrail(
    retriever: MediaMetadataRetriever,
    contactSample: WristSample,
    swingWindow: List<WristSample>,
    aspectRatio: Float,
    durationMs: Long,
    inferenceIntervalMs: Long,
  ): BallTrackingResult {
    val direction = if (swingWindow.last().x - swingWindow.first().x >= 0f) 1f else -1f
    val startTimeMs = max(0L, contactSample.timestampMs - max(24L, inferenceIntervalMs / 2L))
    val endTimeMs = min(durationMs, contactSample.timestampMs + max(260L, inferenceIntervalMs * 7L))
    val stepMs = max(20L, inferenceIntervalMs / 2L)
    val expectedFrames = (((endTimeMs - startTimeMs) / stepMs) + 1L).toInt().coerceAtLeast(1)

    val samples = mutableListOf<BallSample>()
    var previousSample: BallSample? = null
    var velocityX = direction * 0.06f
    var velocityY = -0.04f
    var timestampMs = startTimeMs

    while (timestampMs <= endTimeMs) {
      val frame = retriever.getFrameAtTime(timestampMs * 1000, MediaMetadataRetriever.OPTION_CLOSEST)
      if (frame == null) {
        timestampMs += stepMs
        continue
      }

      val scaledFrame = scaleFrameForBallTracking(frame)
      val expectedX = clamp(
        if (previousSample != null) {
          previousSample.x + velocityX
        } else {
          contactSample.x + (direction * 0.07f)
        },
      )
      val expectedY = clamp(
        if (previousSample != null) {
          previousSample.y + velocityY
        } else {
          contactSample.y - 0.03f
        },
      )

      val candidate = detectBallCandidate(scaledFrame, expectedX, expectedY, direction, previousSample)
      if (candidate != null) {
        val nextSample = BallSample(
          timestampMs = timestampMs,
          x = candidate.x,
          y = candidate.y,
          radiusNorm = candidate.radiusNorm,
          diameterUnits = candidate.diameterUnits,
          score = candidate.score,
        )

        if (isBallProgressionValid(previousSample, nextSample, contactSample, direction, aspectRatio)) {
          previousSample?.let { prior ->
            velocityX = (nextSample.x - prior.x) * 1.08f
            velocityY = (nextSample.y - prior.y) * 1.08f
          }
          samples.add(nextSample)
          previousSample = nextSample
        }
      }

      if (scaledFrame != frame) {
        scaledFrame.recycle()
      }
      frame.recycle()
      timestampMs += stepMs
    }

    return BallTrackingResult(
      samples = refineBallSamples(samples, contactSample, direction, aspectRatio),
      expectedFrames = expectedFrames,
    )
  }

  private fun scaleFrameForBallTracking(frame: Bitmap): Bitmap {
    if (frame.width <= BALL_TRACK_TARGET_WIDTH) {
      return frame
    }

    val scaledHeight = max(1, (frame.height.toFloat() * (BALL_TRACK_TARGET_WIDTH.toFloat() / frame.width.toFloat())).toInt())
    return Bitmap.createScaledBitmap(frame, BALL_TRACK_TARGET_WIDTH, scaledHeight, true)
  }

  private fun detectBallCandidate(
    frame: Bitmap,
    expectedX: Float,
    expectedY: Float,
    direction: Float,
    previousSample: BallSample?,
  ): BallCandidate? {
    val width = frame.width
    val height = frame.height
    val frameAspectRatio = if (height > 0) width.toFloat() / height.toFloat() else 1f
    val searchRadiusX = previousSample?.let { max(0.11f, it.radiusNorm * 5.5f) } ?: 0.22f
    val searchRadiusY = previousSample?.let { max(0.10f, it.radiusNorm * 4.5f) } ?: 0.18f
    val minX = max(0, ((expectedX - searchRadiusX) * width).toInt())
    val maxX = min(width - 1, ((expectedX + searchRadiusX) * width).toInt())
    val minY = max(0, ((expectedY - searchRadiusY) * height).toInt())
    val maxY = min(height - 1, ((expectedY + searchRadiusY) * height).toInt())

    val visited = BooleanArray(width * height)
    var bestCandidate: BallCandidate? = null

    for (y in minY..maxY) {
      for (x in minX..maxX) {
        val index = (y * width) + x
        if (visited[index]) {
          continue
        }

        val color = frame.getPixel(x, y)
        if (!isBallPixel(color)) {
          visited[index] = true
          continue
        }

        val queue = ArrayDeque<Int>()
        queue.add(index)
        visited[index] = true

        var area = 0
        var sumX = 0f
        var sumY = 0f
        var brightnessSum = 0f
        var clusterMinX = x
        var clusterMaxX = x
        var clusterMinY = y
        var clusterMaxY = y

        while (!queue.isEmpty()) {
          val current = queue.removeFirst()
          val currentX = current % width
          val currentY = current / width
          val currentColor = frame.getPixel(currentX, currentY)

          area += 1
          sumX += currentX.toFloat()
          sumY += currentY.toFloat()
          brightnessSum += ((Color.red(currentColor) + Color.green(currentColor) + Color.blue(currentColor)) / 3f)
          clusterMinX = min(clusterMinX, currentX)
          clusterMaxX = max(clusterMaxX, currentX)
          clusterMinY = min(clusterMinY, currentY)
          clusterMaxY = max(clusterMaxY, currentY)

          for (neighborY in max(minY, currentY - 1)..min(maxY, currentY + 1)) {
            for (neighborX in max(minX, currentX - 1)..min(maxX, currentX + 1)) {
              val neighborIndex = (neighborY * width) + neighborX
              if (visited[neighborIndex]) {
                continue
              }

              visited[neighborIndex] = true
              if (isBallPixel(frame.getPixel(neighborX, neighborY))) {
                queue.add(neighborIndex)
              }
            }
          }
        }

        if (area < 6 || area > 240) {
          continue
        }

        val boxWidth = clusterMaxX - clusterMinX + 1
        val boxHeight = clusterMaxY - clusterMinY + 1
        if (boxWidth < 2 || boxHeight < 2) {
          continue
        }

        val centroidX = (sumX / area.toFloat()) / width.toFloat()
        val centroidY = (sumY / area.toFloat()) / height.toFloat()
        val radiusNorm = max(boxWidth.toFloat() / width.toFloat(), boxHeight.toFloat() / height.toFloat()) / 2f
        val diameterUnits = max(
          (boxWidth.toFloat() / width.toFloat()) * frameAspectRatio,
          boxHeight.toFloat() / height.toFloat(),
        )
        val brightnessScore = min(1f, (brightnessSum / area.toFloat()) / 255f)
        val circularityScore = 1f - min(1f, abs(boxWidth - boxHeight).toFloat() / max(boxWidth, boxHeight).toFloat())
        val distanceScore = 1f - min(1f, aspectDistance(centroidX, centroidY, expectedX, expectedY, frameAspectRatio) / 0.30f)
        val expectedDiameter = previousSample?.diameterUnits ?: 0.07f
        val sizeScore = 1f - min(1f, abs(diameterUnits - expectedDiameter) / max(0.03f, expectedDiameter))
        val forwardScore = if ((centroidX - expectedX) * direction >= -0.08f) 1f else 0.55f
        val totalScore = (distanceScore * 0.4f) + (circularityScore * 0.18f) + (brightnessScore * 0.18f) + (sizeScore * 0.14f) + (forwardScore * 0.10f)

        if (totalScore >= 0.34f && (bestCandidate == null || totalScore > bestCandidate.score)) {
          bestCandidate = BallCandidate(
            x = centroidX,
            y = centroidY,
            radiusNorm = radiusNorm,
            diameterUnits = diameterUnits,
            score = totalScore,
          )
        }
      }
    }

    return bestCandidate
  }

  private fun isBallPixel(color: Int): Boolean {
    val red = Color.red(color)
    val green = Color.green(color)
    val blue = Color.blue(color)
    val brightness = (red + green + blue) / 3
    val maxChannel = max(red, max(green, blue))
    val minChannel = min(red, min(green, blue))
    val spread = maxChannel - minChannel
    val neutralLight = brightness >= 158 && maxChannel >= 180 && spread <= 120
    val warmLight = brightness >= 150 && red >= 160 && green >= 140 && blue >= 95
    return neutralLight || warmLight
  }

  
  private fun isBallProgressionValid(
    previousSample: BallSample?,
    nextSample: BallSample,
    contactSample: WristSample,
    direction: Float,
    aspectRatio: Float,
  ): Boolean {
    if (previousSample == null) {
      val nearContact = (nextSample.x - contactSample.x) * direction >= -0.08f
      val nearHeight = nextSample.y <= contactSample.y + 0.18f
      return nearContact && nearHeight
    }

    val motion = aspectDistance(previousSample.x, previousSample.y, nextSample.x, nextSample.y, aspectRatio)
    if (motion < 0.006f || motion > 0.42f) {
      return false
    }

    val progressesForward = (nextSample.x - previousSample.x) * direction >= -0.04f
    val staysNearFlightBand = nextSample.y <= previousSample.y + 0.10f
    return progressesForward && staysNearFlightBand
  }
  private fun refineBallSamples(
    samples: List<BallSample>,
    contactSample: WristSample,
    direction: Float,
    aspectRatio: Float,
  ): List<BallSample> {
    if (samples.size < 2) {
      return emptyList()
    }

    val orderedSamples = samples.sortedBy { it.timestampMs }
    val refined = mutableListOf<BallSample>()

    orderedSamples.forEach { sample ->
      val previous = refined.lastOrNull()
      if (previous == null) {
        val isNearContactWindow = (sample.x - contactSample.x) * direction >= -0.08f && sample.y <= contactSample.y + 0.18f
        if (isNearContactWindow) {
          refined.add(sample)
        }
      } else {
        val deltaTime = sample.timestampMs - previous.timestampMs
        val motion = aspectDistance(previous.x, previous.y, sample.x, sample.y, aspectRatio)
        val progressesForward = (sample.x - previous.x) * direction >= -0.03f
        if (deltaTime >= 15L && motion >= 0.006f && progressesForward) {
          refined.add(sample)
        }
      }
    }

    return if (refined.size >= 2) refined.take(6) else emptyList()
  }

  private fun computeBallTrackingQuality(samples: List<BallSample>, expectedFrames: Int): Float {
    if (samples.isEmpty()) {
      return 0f
    }

    val coverageScore = min(1f, samples.size.toFloat() / expectedFrames.toFloat())
    val confidenceScore = samples.map { it.score }.average().toFloat().coerceIn(0f, 1f)
    var continuityHits = 0
    for (index in 1 until samples.size) {
      if (samples[index].timestampMs - samples[index - 1].timestampMs <= 120L) {
        continuityHits += 1
      }
    }
    val continuityScore = if (samples.size <= 1) 0f else continuityHits.toFloat() / (samples.size - 1).toFloat()

    return ((coverageScore * 0.45f) + (confidenceScore * 0.4f) + (continuityScore * 0.15f)).coerceIn(0f, 1f)
  }

  private fun computeBallSpeedMph(samples: List<BallSample>, aspectRatio: Float, contactShoulderSpan: Float): Float {
    if (samples.size < 2) {
      return 0f
    }

    val feetPerUnit = computeFeetPerUnit(samples, contactShoulderSpan)
    val speeds = mutableListOf<Float>()

    for (index in 1 until samples.size) {
      val first = samples[index - 1]
      val second = samples[index]
      val deltaTimeSeconds = max(1L, second.timestampMs - first.timestampMs).toFloat() / 1000f
      val motionUnits = aspectDistance(first.x, first.y, second.x, second.y, aspectRatio)
      val feetPerSecond = (motionUnits * feetPerUnit) / deltaTimeSeconds
      if (feetPerSecond > 0f) {
        speeds.add(feetPerSecond / FEET_PER_MPH_SECOND)
      }
    }

    if (speeds.isEmpty()) {
      return 0f
    }

    val launchWindow = speeds.take(3).sortedDescending().take(2)
    return min(80f, max(0f, launchWindow.average().toFloat()))
  }

  private fun computeBallTravelFeet(samples: List<BallSample>, aspectRatio: Float, contactShoulderSpan: Float): Float {
    if (samples.size < 2) {
      return 0f
    }

    val feetPerUnit = computeFeetPerUnit(samples, contactShoulderSpan)
    val distanceUnits = aspectDistance(samples.first().x, samples.first().y, samples.last().x, samples.last().y, aspectRatio)
    return max(0f, distanceUnits * feetPerUnit)
  }

  private fun computeFeetPerUnit(samples: List<BallSample>, contactShoulderSpan: Float): Float {
    val usableDiameters = samples.map { it.diameterUnits }.filter { it in 0.012f..0.18f }
    return if (usableDiameters.isNotEmpty()) {
      VOLLEYBALL_DIAMETER_FEET / usableDiameters.average().toFloat()
    } else {
      ASSUMED_SHOULDER_WIDTH_FEET / max(0.04f, contactShoulderSpan)
    }
  }

  private fun extractVideoFps(retriever: MediaMetadataRetriever, durationMs: Long): Float {
    val captureFps = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CAPTURE_FRAMERATE)?.toFloatOrNull()
    if (captureFps != null && captureFps >= 24f) {
      return min(240f, captureFps)
    }

    val frameCount = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_FRAME_COUNT)?.toFloatOrNull()
    if (frameCount != null && durationMs > 0L) {
      val inferredFps = frameCount / (durationMs.toFloat() / 1000f)
      if (inferredFps >= 24f) {
        return min(240f, inferredFps)
      }
    }

    return 60f
  }

  private fun computeGroundBaselineY(samples: List<WristSample>): Float {
    val ankleYs = samples.mapNotNull { sample ->
      if (sample.ankleVisibility >= 0.2f && !sample.ankleCenterY.isNaN()) sample.ankleCenterY else null
    }

    if (ankleYs.isNotEmpty()) {
      return ankleYs.sortedDescending().take(min(4, ankleYs.size)).average().toFloat()
    }

    val estimatedGround = samples.map { it.hipCenterY + (it.shoulderSpan * 2.75f) }.average().toFloat()
    return min(0.98f, estimatedGround)
  }

  private fun computeReachHeightInches(sample: WristSample, groundBaselineY: Float): Float {
    val verticalUnits = max(0f, groundBaselineY - sample.y)
    val reachFeet = (verticalUnits / max(0.04f, sample.shoulderSpan)) * ASSUMED_SHOULDER_WIDTH_FEET
    return min(168f, max(0f, reachFeet * 12f))
  }

  private fun computeVerticalLeapInches(samples: List<WristSample>, contactSample: WristSample, groundBaselineY: Float): Float {
    val ankleRiseUnits = if (contactSample.ankleVisibility >= 0.2f && !contactSample.ankleCenterY.isNaN()) {
      max(0f, groundBaselineY - contactSample.ankleCenterY)
    } else {
      val baselineHipY = samples.maxOfOrNull { it.hipCenterY } ?: contactSample.hipCenterY
      max(0f, baselineHipY - contactSample.hipCenterY)
    }

    val leapFeet = (ankleRiseUnits / max(0.04f, contactSample.shoulderSpan)) * ASSUMED_SHOULDER_WIDTH_FEET
    return min(48f, max(0f, leapFeet * 12f))
  }

  private fun inferLandingStability(samples: List<WristSample>, contactSample: WristSample, aspectRatio: Float): String {
    val postSamples = samples.filter { it.timestampMs >= contactSample.timestampMs }
    if (postSamples.size < 2) {
      return "steady"
    }

    val landingSample = postSamples.last()
    val hipDrift = abs((landingSample.hipCenterX - contactSample.hipCenterX) * aspectRatio) / max(0.04f, contactSample.shoulderSpan)
    val ankleDrift = if (
      landingSample.ankleVisibility >= 0.2f &&
      contactSample.ankleVisibility >= 0.2f &&
      !landingSample.ankleCenterX.isNaN() &&
      !contactSample.ankleCenterX.isNaN()
    ) {
      abs((landingSample.ankleCenterX - contactSample.ankleCenterX) * aspectRatio) / max(0.04f, contactSample.shoulderSpan)
    } else {
      0f
    }
    val landingStack = if (landingSample.ankleVisibility >= 0.2f && !landingSample.ankleCenterX.isNaN()) {
      abs((landingSample.hipCenterX - landingSample.ankleCenterX) * aspectRatio) / max(0.04f, landingSample.shoulderSpan)
    } else {
      0f
    }

    return if (hipDrift > 0.34f || ankleDrift > 0.32f || landingStack > 0.24f) "off-balance" else "steady"
  }

  private fun computeReleaseFrames(
    ballSamples: List<BallSample>,
    contactSample: WristSample,
    fps: Float,
    inferenceIntervalMs: Long,
  ): Int {
    val firstFlightSample = ballSamples.firstOrNull { it.timestampMs > contactSample.timestampMs } ?: ballSamples.firstOrNull()
    val releaseMs = if (firstFlightSample != null) {
      max((inferenceIntervalMs / 2L).toFloat(), (firstFlightSample.timestampMs - contactSample.timestampMs).toFloat())
    } else {
      max(24f, inferenceIntervalMs.toFloat())
    }

    val derivedFrames = ((releaseMs / 1000f) * max(24f, fps)).toInt()
    return min(24, max(1, derivedFrames))
  }

  private fun averageOrNaN(values: List<Float>): Float {
    val usable = values.filter { !it.isNaN() }
    return if (usable.isNotEmpty()) usable.average().toFloat() else Float.NaN
  }

  private fun buildSample(
    landmarks: List<NormalizedLandmark>,
    timestampMs: Long,
    isRightHand: Boolean,
    aspectRatio: Float,
  ): WristSample? {
    val wristIndex = if (isRightHand) RIGHT_WRIST_INDEX else LEFT_WRIST_INDEX
    val elbowIndex = if (isRightHand) RIGHT_ELBOW_INDEX else LEFT_ELBOW_INDEX
    val shoulderIndex = if (isRightHand) RIGHT_SHOULDER_INDEX else LEFT_SHOULDER_INDEX

    val wrist = landmarks[wristIndex]
    val elbow = landmarks[elbowIndex]
    val shoulder = landmarks[shoulderIndex]
    val leftShoulder = landmarks[LEFT_SHOULDER_INDEX]
    val rightShoulder = landmarks[RIGHT_SHOULDER_INDEX]
    val leftHip = landmarks[LEFT_HIP_INDEX]
    val rightHip = landmarks[RIGHT_HIP_INDEX]
    val leftAnkle = landmarks[LEFT_ANKLE_INDEX]
    val rightAnkle = landmarks[RIGHT_ANKLE_INDEX]

    val visibility = minOf(
      optionalValue(wrist),
      optionalValue(elbow),
      optionalValue(shoulder),
      optionalValue(leftShoulder),
      optionalValue(rightShoulder),
      optionalValue(leftHip),
      optionalValue(rightHip),
    )
    if (visibility < 0.25f) {
      return null
    }

    val shoulderSpan = aspectDistance(
      leftShoulder.x(),
      leftShoulder.y(),
      rightShoulder.x(),
      rightShoulder.y(),
      aspectRatio,
    )
    if (shoulderSpan < 0.025f) {
      return null
    }

    val smoothedX = (wrist.x() * 0.75f) + (elbow.x() * 0.25f)
    val smoothedY = (wrist.y() * 0.75f) + (elbow.y() * 0.25f)
    val ankleVisibility = min(optionalValue(leftAnkle), optionalValue(rightAnkle))
    val ankleCenterX = if (ankleVisibility >= 0.2f) (leftAnkle.x() + rightAnkle.x()) / 2f else Float.NaN
    val ankleCenterY = if (ankleVisibility >= 0.2f) (leftAnkle.y() + rightAnkle.y()) / 2f else Float.NaN

    return WristSample(
      timestampMs = timestampMs,
      x = smoothedX,
      y = smoothedY,
      shoulderX = shoulder.x(),
      shoulderY = shoulder.y(),
      hipCenterX = (leftHip.x() + rightHip.x()) / 2f,
      hipCenterY = (leftHip.y() + rightHip.y()) / 2f,
      ankleCenterX = ankleCenterX,
      ankleCenterY = ankleCenterY,
      ankleVisibility = ankleVisibility,
      visibility = visibility,
      shoulderSpan = shoulderSpan,
    )
  }

  private fun optionalValue(landmark: NormalizedLandmark): Float {
    return landmark.visibility().orElse(0f)
  }

  private fun scoreHand(samples: List<WristSample>): Float {
    if (samples.isEmpty()) {
      return 0f
    }

    return computePathLength(samples) + (samples.size * 0.015f)
  }

  private fun computePathLength(samples: List<WristSample>): Float {
    var total = 0f
    for (index in 1 until samples.size) {
      total += distance(samples[index - 1], samples[index])
    }
    return total
  }

  private fun smoothSamples(samples: List<WristSample>): List<WristSample> {
    if (samples.size < 3) {
      return samples
    }

    return samples.indices.map { index ->
      val start = max(0, index - 1)
      val end = min(samples.lastIndex, index + 1)
      val window = samples.subList(start, end + 1)
      WristSample(
        timestampMs = samples[index].timestampMs,
        x = window.map { it.x }.average().toFloat(),
        y = window.map { it.y }.average().toFloat(),
        shoulderX = window.map { it.shoulderX }.average().toFloat(),
        shoulderY = window.map { it.shoulderY }.average().toFloat(),
        hipCenterX = window.map { it.hipCenterX }.average().toFloat(),
        hipCenterY = window.map { it.hipCenterY }.average().toFloat(),
        ankleCenterX = averageOrNaN(window.map { it.ankleCenterX }),
        ankleCenterY = averageOrNaN(window.map { it.ankleCenterY }),
        ankleVisibility = window.map { it.ankleVisibility }.average().toFloat(),
        visibility = window.map { it.visibility }.average().toFloat(),
        shoulderSpan = window.map { it.shoulderSpan }.average().toFloat(),
      )
    }
  }

  private fun selectSwingWindow(samples: List<WristSample>): List<WristSample> {
    if (samples.size <= 5) {
      return samples
    }

    val peakIndex = findPeakVelocityIndex(samples)
    val start = max(0, peakIndex - 2)
    val end = min(samples.lastIndex, peakIndex + 2)
    val window = samples.subList(start, end + 1)

    return if (window.size >= 4) window else evenlySample(samples, 5)
  }

  private fun findPeakVelocityIndex(samples: List<WristSample>): Int {
    var peakIndex = samples.size / 2
    var peakVelocity = 0f

    for (index in 1 until samples.size) {
      val velocity = velocity(samples[index - 1], samples[index])
      if (velocity > peakVelocity) {
        peakVelocity = velocity
        peakIndex = index
      }
    }

    return peakIndex
  }

  private fun evenlySample(samples: List<WristSample>, targetCount: Int): List<WristSample> {
    if (samples.size <= targetCount) {
      return samples
    }

    val result = mutableListOf<WristSample>()
    for (index in 0 until targetCount) {
      val mappedIndex = ((samples.lastIndex.toFloat() / (targetCount - 1).toFloat()) * index).toInt()
      result.add(samples[mappedIndex])
    }
    return result
  }

  private fun computeHitchFrames(samples: List<WristSample>): Int {
    if (samples.size < 4) {
      return 0
    }

    val speeds = mutableListOf<Float>()
    for (index in 1 until samples.size) {
      speeds.add(velocity(samples[index - 1], samples[index]))
    }

    val peakSpeed = speeds.maxOrNull() ?: return 0
    var hitchCount = 0
    for (index in 1 until speeds.lastIndex) {
      val current = speeds[index]
      val previous = speeds[index - 1]
      val next = speeds[index + 1]
      if (current < peakSpeed * 0.58f && current < previous * 0.82f && next > current * 1.15f) {
        hitchCount += 1
      }
    }

    var reversalCount = 0
    for (index in 1 until samples.lastIndex) {
      val deltaOne = samples[index].x - samples[index - 1].x
      val deltaTwo = samples[index + 1].x - samples[index].x
      if (abs(deltaOne) > 0.012f && abs(deltaTwo) > 0.012f && deltaOne * deltaTwo < 0f) {
        reversalCount += 1
      }
    }

    val derivedFrames = (hitchCount * 2) + reversalCount
    return max(0, min(6, derivedFrames))
  }

  private fun inferContactPoint(samples: List<WristSample>): String {
    val contactSample = samples.minByOrNull { it.y } ?: return "ideal"
    val direction = if (samples.last().x - samples.first().x >= 0f) 1f else -1f
    val offsetFromShoulder = (contactSample.x - contactSample.shoulderX) * direction

    return when {
      offsetFromShoulder < -0.05f -> "behind"
      offsetFromShoulder > 0.16f -> "in-front"
      else -> "ideal"
    }
  }

  private fun computePeakHandSpeedMph(samples: List<WristSample>, aspectRatio: Float): Float {
    if (samples.size < 2) {
      return 0f
    }

    var peakFeetPerSecond = 0f
    for (index in 1 until samples.size) {
      val first = samples[index - 1]
      val second = samples[index]
      val deltaTimeSeconds = max(1L, second.timestampMs - first.timestampMs).toFloat() / 1000f
      val motionUnits = aspectDistance(first.x, first.y, second.x, second.y, aspectRatio)
      val shoulderSpan = max(0.04f, (first.shoulderSpan + second.shoulderSpan) / 2f)
      val motionFeet = (motionUnits / shoulderSpan) * ASSUMED_SHOULDER_WIDTH_FEET
      val feetPerSecond = motionFeet / deltaTimeSeconds
      if (feetPerSecond > peakFeetPerSecond) {
        peakFeetPerSecond = feetPerSecond
      }
    }

    return min(34f, max(0f, peakFeetPerSecond / FEET_PER_MPH_SECOND))
  }

  private fun estimateBallSpeedMph(peakHandSpeedMph: Float, quality: Float): Float {
    if (peakHandSpeedMph <= 6f || quality < 0.25f) {
      return 0f
    }

    val qualityFactor = 0.92f + min(0.18f, quality * 0.22f)
    val estimate = peakHandSpeedMph * BALL_SPEED_TRANSFER_MULTIPLIER * qualityFactor
    return min(80f, max(18f, estimate))
  }

  private fun createHandTrailArray(samples: List<WristSample>) = Arguments.createArray().apply {
    samples.forEach { sample ->
      pushMap(Arguments.createMap().apply {
        putDouble("x", clamp(sample.x).toDouble())
        putDouble("y", clamp(sample.y).toDouble())
        putDouble("timestampMs", sample.timestampMs.toDouble())
      })
    }
  }

  private fun createBallTrailArray(samples: List<BallSample>) = Arguments.createArray().apply {
    samples.forEach { sample ->
      pushMap(Arguments.createMap().apply {
        putDouble("x", clamp(sample.x).toDouble())
        putDouble("y", clamp(sample.y).toDouble())
        putDouble("timestampMs", sample.timestampMs.toDouble())
      })
    }
  }

  private fun velocity(first: WristSample, second: WristSample): Float {
    val deltaTime = max(1L, second.timestampMs - first.timestampMs).toFloat()
    return distance(first, second) / deltaTime
  }

  private fun distance(first: WristSample, second: WristSample): Float {
    val dx = second.x - first.x
    val dy = second.y - first.y
    return sqrt((dx * dx) + (dy * dy))
  }

  private fun aspectDistance(x1: Float, y1: Float, x2: Float, y2: Float, aspectRatio: Float): Float {
    val dx = (x2 - x1) * aspectRatio
    val dy = y2 - y1
    return sqrt((dx * dx) + (dy * dy))
  }

  private fun clamp(value: Float): Float {
    return min(0.98f, max(0.02f, value))
  }

  private data class WristSample(
    val timestampMs: Long,
    val x: Float,
    val y: Float,
    val shoulderX: Float,
    val shoulderY: Float,
    val hipCenterX: Float,
    val hipCenterY: Float,
    val ankleCenterX: Float,
    val ankleCenterY: Float,
    val ankleVisibility: Float,
    val visibility: Float,
    val shoulderSpan: Float,
  )

  private data class BallCandidate(
    val x: Float,
    val y: Float,
    val radiusNorm: Float,
    val diameterUnits: Float,
    val score: Float,
  )

  private data class BallSample(
    val timestampMs: Long,
    val x: Float,
    val y: Float,
    val radiusNorm: Float,
    val diameterUnits: Float,
    val score: Float,
  )

  private data class BallTrackingResult(
    val samples: List<BallSample>,
    val expectedFrames: Int,
  )

  companion object {
    private const val LEFT_SHOULDER_INDEX = 11
    private const val RIGHT_SHOULDER_INDEX = 12
    private const val LEFT_ELBOW_INDEX = 13
    private const val RIGHT_ELBOW_INDEX = 14
    private const val LEFT_WRIST_INDEX = 15
    private const val RIGHT_WRIST_INDEX = 16
    private const val LEFT_HIP_INDEX = 23
    private const val RIGHT_HIP_INDEX = 24
    private const val LEFT_ANKLE_INDEX = 27
    private const val RIGHT_ANKLE_INDEX = 28
    private const val FEET_PER_MPH_SECOND = 1.46667f
    private const val ASSUMED_SHOULDER_WIDTH_FEET = 1.35f
    private const val BALL_SPEED_TRANSFER_MULTIPLIER = 2.08f
    private const val VOLLEYBALL_DIAMETER_FEET = 0.688f
    private const val BALL_TRACK_TARGET_WIDTH = 220
  }
}
