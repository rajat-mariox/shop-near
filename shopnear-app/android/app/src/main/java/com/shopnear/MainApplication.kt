package com.shopnear

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    createNotificationChannels()
  }

  // FCM background notifications ke liye HIGH importance channel. Bina iske Android
  // fallback "Miscellaneous" channel use karta hai: na heads-up banner, na sound.
  // Backend isi channel id par bhejta hai (android.notification.channelId).
  // Channel id versioned hai (_v2): Android existing channel ki sound/importance
  // app se badalne nahi deta, isliye purane build me bana silent channel delete
  // karke naya sound wala channel banate hain.
  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java) ?: return
    LEGACY_CHANNEL_IDS.forEach { id ->
      if (manager.getNotificationChannel(id) != null) manager.deleteNotificationChannel(id)
    }
    val channel =
      NotificationChannel(ORDER_CHANNEL_ID, "Order Updates", NotificationManager.IMPORTANCE_HIGH)
        .apply {
          description = "Order status, delivery OTP and delivery updates"
          enableLights(true)
          lightColor = 0xFFFF6051.toInt()
          enableVibration(true)
          setShowBadge(true)
          setSound(
            RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
            AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_NOTIFICATION)
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .build(),
          )
        }
    manager.createNotificationChannel(channel)
  }

  companion object {
    const val ORDER_CHANNEL_ID = "order_updates_v2"
    // Purane channel ids — install par delete hote hain (silent ban chuke the)
    val LEGACY_CHANNEL_IDS = listOf("order_updates")
  }
}
