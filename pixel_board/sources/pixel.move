// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// This module defines a pixel type that can be used to create pixel art on the Sui blockchain
module pixel_board::pixel {
    // Import the string module from the standard library
    use std::string::{String, utf8};

    // Define a struct type called Pixel that has key, and store abilities
    struct Pixel has store, drop {
        // The color of the pixel as a hex string (e.g. "#FF0000" for red)
        color: String
    }

    // Define a public constructor function that takes the x, y, and color parameters and returns a new Pixel instance
    public fun new(): Pixel {
        // Create and return a new Pixel struct with the given fields
        Pixel {
            color: utf8(b"ffffff")
        }
    }

    // Define a public getter function that takes a reference to a Pixel instance and returns its color
    public fun color(self: &Pixel): String { self.color }

    public fun update_color(self: &mut Pixel, color: String) {
        self.color = color;
    }

}
