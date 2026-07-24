# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ===== Hermes =====
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.** { *; }

# ===== React Native Core =====
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.views.** { *; }
-keep class com.facebook.react.devsupport.** { *; }
-keep class com.facebook.react.defaults.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.soloader.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# ===== Razorpay =====
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# ===== React Native Libraries =====
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.** { *; }
-keep class com.oblador.** { *; }
-keep class com.reactnativecommunity.** { *; }
-keep class com.imagepicker.** { *; }
-keep class com.horcrux.svg.** { *; }

# ===== General =====
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-dontwarn com.facebook.**
-dontwarn sun.misc.**
