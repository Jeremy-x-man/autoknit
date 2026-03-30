cmake_minimum_required(VERSION 3.14)
project(autoknit C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# -----------------------------------------------------------------------
# Compile definitions
# -----------------------------------------------------------------------
add_definitions(-DKIT_RAW_SDL_EVENTS -D_THREAD_SAFE -DGLM_ENABLE_EXPERIMENTAL)

# -----------------------------------------------------------------------
# System dependencies
# All dependencies are resolved from the system package manager (apt).
# No git submodules or nest-libs are required.
#
# Required packages (Ubuntu/Debian):
#   sudo apt-get install -y cmake build-essential libeigen3-dev \
#       libglm-dev libpng-dev zlib1g-dev libgl-dev
#
# SDL3 must be compiled from source (see README-cmake-node.md).
# -----------------------------------------------------------------------
find_package(Eigen3 REQUIRED)
find_package(OpenGL REQUIRED)

# SDL3 — installed to /usr/local by default when built from source
find_library(SDL3_LIBRARY NAMES SDL3 HINTS /usr/local/lib REQUIRED)
find_path(SDL3_INCLUDE_DIR NAMES SDL3/SDL.h HINTS /usr/local/include REQUIRED)

# -----------------------------------------------------------------------
# Include directories (all from system paths)
# -----------------------------------------------------------------------
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/kit
    ${EIGEN3_INCLUDE_DIRS}
    ${SDL3_INCLUDE_DIR}
    /usr/include/glm          # libglm-dev
)

# -----------------------------------------------------------------------
# libgeodesic (sub-library, built from source in this repo)
# -----------------------------------------------------------------------
add_subdirectory(libgeodesic)

# -----------------------------------------------------------------------
# Source file lists
# -----------------------------------------------------------------------
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

set(AUTOKNIT_SOURCES
    ak-link_chains.cpp
    ak-optimal_link.cpp
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

# -----------------------------------------------------------------------
# autoknit_core — static library containing all C++ core logic
# -----------------------------------------------------------------------
add_library(autoknit_core STATIC
    ${KIT_SOURCES}
    ${AUTOKNIT_SOURCES}
    ${SCHEDULE_SOURCES}
)

target_link_libraries(autoknit_core PUBLIC geodesic)

# -----------------------------------------------------------------------
# autoknit_node — Node.js Native Addon (.node)
# Built only when invoked via cmake-js (CMAKE_JS_VERSION is set).
# -----------------------------------------------------------------------
if(CMAKE_JS_VERSION)
    # Locate node-addon-api include path via node
    execute_process(
        COMMAND node -p "require('node-addon-api').include.replace(/\"/g, '')"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        OUTPUT_STRIP_TRAILING_WHITESPACE
    )

    add_library(autoknit_node MODULE addon.cpp)

    target_include_directories(autoknit_node PRIVATE
        ${NODE_ADDON_API_DIR}
        ${CMAKE_JS_INC}
    )

    set_target_properties(autoknit_node PROPERTIES
        PREFIX ""
        SUFFIX ".node"
    )

    target_link_libraries(autoknit_node PRIVATE
        autoknit_core
        ${CMAKE_JS_LIB}
        ${SDL3_LIBRARY}
        OpenGL::GL
        m
        pthread
        png
        z
    )
endif()
