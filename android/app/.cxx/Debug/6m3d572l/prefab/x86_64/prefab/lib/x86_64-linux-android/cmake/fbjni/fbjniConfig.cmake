if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/Users/zetabox/.gradle/caches/8.10.2/transforms/93929f6f826a0adf8a292ff8a7f6a61a/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/libs/android.x86_64/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/zetabox/.gradle/caches/8.10.2/transforms/93929f6f826a0adf8a292ff8a7f6a61a/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

