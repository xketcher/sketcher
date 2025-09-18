LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := heybook
LOCAL_SRC_FILES := heybook.c
LOCAL_STRIP_MODULE := true

include $(BUILD_SHARED_LIBRARY)