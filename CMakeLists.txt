cmake_minimum_required(VERSION 3.14)
project(autoknit C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Definitions
add_definitions(-DKIT_RAW_SDL_EVENTS -D_THREAD_SAFE -DGLM_ENABLE_EXPERIMENTAL)

# Find dependencies
find_package(Eigen3 REQUIRED)

# Paths to nest-libs
set(NEST_LIBS ${CMAKE_CURRENT_SOURCE_DIR}/../nest-libs/linux)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/kit
    ${EIGEN3_INCLUDE_DIRS}
    /usr/local/include
    ${NEST_LIBS}/glm/include
    ${NEST_LIBS}/libpng/include
    ${NEST_LIBS}/zlib/include
)

# Add libgeodesic
add_subdirectory(libgeodesic)

# Define sources
set(KIT_SOURCES
    kit/Button.cpp
    kit/GLProgram.cpp
    kit/kit.cpp
    kit/kit-SDL3.cpp
    kit/Load.cpp
    kit/load_save_png.cpp
    kit/MeshBuffer.cpp
    kit/path.cpp
)

set(PLAN_TRANSFERS_SOURCES
    plan_transfers.cpp
    plan_transfers-draw_beds.cpp
    plan_transfers-run_transfers.cpp
    plan_transfers-best_collapse.cpp
    plan_transfers-best_shift.cpp
    plan_transfers-best_expand.cpp
    plan_transfers-minimize_winding.cpp
)

set(LINK_SOURCES
    ak-link_chains.cpp
    ak-optimal_link.cpp
)

set(AUTOKNIT_SOURCES
    ${LINK_SOURCES}
    ak-trace_graph.cpp
    ak-peel_slice-euclidean.cpp
    ak-trim_model.cpp
    ak-embedded_path.cpp
    ak-build_next_active_chains.cpp
    ak-extract_level_chains.cpp
    ak-find_first_active_chains.cpp
    ak-sample_chain.cpp
    Interface.cpp
    init.cpp
    load_obj.cpp
    ak-load_constraints.cpp
    ak-embed_constraints.cpp
    ak-interpolate_values.cpp
)

set(SCHEDULE_SOURCES
    Stitch.cpp
    ScheduleCost.cpp
    schedule.cpp
    embed_DAG.cpp
    ${PLAN_TRANSFERS_SOURCES}
)

# We create a static library containing all the core logic
add_library(autoknit_core STATIC
    ${KIT_SOURCES}
    ${AUTOKNIT_SOURCES}
    ${SCHEDULE_SOURCES}
)

target_link_libraries(autoknit_core PUBLIC geodesic)

# Node.js Addon configuration
# cmake-js provides CMAKE_JS_VERSION if running via cmake-js
if(CMAKE_JS_VERSION)
    execute_process(COMMAND node -p "require('node-addon-api').include.replace(/\"/g, '')"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        OUTPUT_STRIP_TRAILING_WHITESPACE)
    
    add_library(autoknit_node MODULE addon.cpp)
    target_include_directories(autoknit_node PRIVATE ${NODE_ADDON_API_DIR} ${CMAKE_JS_INC})
    set_target_properties(autoknit_node PROPERTIES PREFIX "" SUFFIX ".node")
    
    # Link against nest-libs
    target_link_directories(autoknit_node PRIVATE
        ${NEST_LIBS}/libpng/lib
        ${NEST_LIBS}/zlib/lib
    )
    
    target_link_libraries(autoknit_node PRIVATE 
        autoknit_core 
        ${CMAKE_JS_LIB}
        SDL3 m pthread GL
        png z
    )
endif()
