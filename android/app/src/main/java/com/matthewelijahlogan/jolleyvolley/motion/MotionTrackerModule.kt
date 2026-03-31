package com.matthewelijahlogan.jolleyvolley.motion

import android.graphics.Bitmap
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

        if (landmarks != null && landmarks.size > RIGHT_HIP_INDEX) {
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

      val hitchFrames = computeHitchFrames(swingWindow)
      val contactPoint = inferContactPoint(swingWindow)
      val quality = if (processedFrames > 0) selectedSamples.size.toFloat() / processedFrames.toFloat() else 0f
      val peakHandSpeedMph = computePeakHandSpeedMph(swingWindow, aspectRatio)
      val estimatedBallSpeedMph = estimateBallSpeedMph(peakHandSpeedMph, quality)

      putString("dominantHand", dominantHand)
      putInt("processedFrames", processedFrames)
      putInt("trackedFrames", selectedSamples.size)
      putInt("hitchFrames", hitchFrames)
      putString("contactPoint", contactPoint)
      putDouble("trackingQuality", quality.toDouble())
      putInt("inferenceIntervalMs", inferenceIntervalMs.toInt())
      putDouble("peakHandSpeedMph", peakHandSpeedMph.toDouble())
      putDouble("estimatedBallSpeedMph", estimatedBallSpeedMph.toDouble())
      putArray("handTrail", createTrailArray(swingWindow))
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

    val visibility = minOf(
      optionalValue(wrist),
      optionalValue(elbow),
      optionalValue(shoulder),
      optionalValue(leftShoulder),
      optionalValue(rightShoulder),
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

    return WristSample(
      timestampMs = timestampMs,
      x = smoothedX,
      y = smoothedY,
      shoulderX = shoulder.x(),
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

  private fun createTrailArray(samples: List<WristSample>) = Arguments.createArray().apply {
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
    val visibility: Float,
    val shoulderSpan: Float,
  )

  companion object {
    private const val LEFT_SHOULDER_INDEX = 11
    private const val RIGHT_SHOULDER_INDEX = 12
    private const val LEFT_ELBOW_INDEX = 13
    private const val RIGHT_ELBOW_INDEX = 14
    private const val LEFT_WRIST_INDEX = 15
    private const val RIGHT_WRIST_INDEX = 16
    private const val RIGHT_HIP_INDEX = 24
    private const val FEET_PER_MPH_SECOND = 1.46667f
    private const val ASSUMED_SHOULDER_WIDTH_FEET = 1.35f
    private const val BALL_SPEED_TRANSFER_MULTIPLIER = 2.08f
  }
}