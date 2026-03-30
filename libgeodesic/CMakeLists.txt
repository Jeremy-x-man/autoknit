cmake_minimum_required(VERSION 3.14)
project(geodesic C)

file(GLOB GEODESIC_SOURCES "src/*.c")
# Exclude main.c if it exists
list(REMOVE_ITEM GEODESIC_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/src/main.c")

add_library(geodesic STATIC ${GEODESIC_SOURCES})
target_include_directories(geodesic PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include /usr/include/suitesparse)
target_link_libraries(geodesic PUBLIC m)
