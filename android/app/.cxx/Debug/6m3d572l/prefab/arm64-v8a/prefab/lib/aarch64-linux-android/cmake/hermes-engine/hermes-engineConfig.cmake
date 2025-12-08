if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/zetabox/.gradle/caches/8.10.2/transforms/b712aaad311b3f540ba74bdb04353f76/transformed/jetified-hermes-android-0.78.0-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/zetabox/.gradle/caches/8.10.2/transforms/b712aaad311b3f540ba74bdb04353f76/transformed/jetified-hermes-android-0.78.0-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

