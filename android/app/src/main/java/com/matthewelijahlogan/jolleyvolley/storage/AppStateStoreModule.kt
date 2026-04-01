package com.matthewelijahlogan.jolleyvolley.storage

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppStateStoreModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  override fun getName(): String = "AppStateStore"

  @ReactMethod
  fun load(promise: Promise) {
    promise.resolve(prefs.getString(APP_STATE_KEY, null))
  }

  @ReactMethod
  fun save(state: String, promise: Promise) {
    prefs.edit().putString(APP_STATE_KEY, state).apply()
    promise.resolve(true)
  }

  @ReactMethod
  fun clear(promise: Promise) {
    prefs.edit().remove(APP_STATE_KEY).apply()
    promise.resolve(true)
  }

  companion object {
    private const val PREFS_NAME = "jolley_volley_local_state"
    private const val APP_STATE_KEY = "app_state_json"
  }
}
