// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module pixel_board::board {
    use std::string::{String, utf8};
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;

    // Define a constant error code for wrong coordinates
    const EWrongCoordinates: u64 = 0;

    struct Board has key {
        id: UID,
        dimension_x: u64, // The horizontal dimension of the board
        dimension_y: u64, // The vertical dimension of the board
        pixels: vector<vector<String>> // A two-dimensional vector of strings representing the colors of the pixels
    }

    public fun create_board(
        dimension: u64, // The parameter for the dimension of the board (assumed to be square)
        ctx: &mut TxContext
    ) {
        let pixels = vector::empty<vector<String>>(); // Create an empty vector of vectors of strings
        let i = 0; // Initialize a loop counter i
        let loops = 100; // Define a constant for the number of loops

        while (i < loops) { // Loop from 0 to 99
            let tmp_vec = vector::empty<String>(); // Create an empty vector of strings

            let j = 0; // Initialize another loop counter j
            while (j < loops) { // Loop from 0 to 99
                vector::insert(&mut tmp_vec, utf8(b"ffffff"), j); // Insert a string representing white color ("ffffff") at index j in tmp_vec
                j = j + 1; // Increment j by 1
            };

            vector::insert(&mut pixels, tmp_vec, i); // Insert tmp_vec at index i in pixels
            i = i + 1; // Increment i by 1
        };

        transfer::share_object(
            Board {
                id: object::new(ctx),
                dimension_x: dimension, // The dimension_x is set to the parameter dimension
                dimension_y: dimension, // The dimension_y is set to the parameter dimension
                pixels // The pixels is set to the vector of vectors created above
            }
        );
    }

    /// Private function that updates a single pixel on the board
    fun update_pixel(
        self: &mut Board,
        x: u64, // The parameter for the x coordinate of the pixel (0-based)
        y: u64, // The parameter for the y coordinate of the pixel (0-based)
        color: String // The parameter for the color of the pixel (a string representing a hex code)
    ) {
        assert!(x < self.dimension_x && y < self.dimension_y, EWrongCoordinates); // Check that the coordinates are valid and within bounds, otherwise abort with error code EWrongCoordinates
        let mut_vector = vector::borrow_mut(&mut self.pixels, x); // Borrow a mutable reference to the vector at index x in self.pixels
        *vector::borrow_mut(mut_vector, y) = color; // Assign color to the element at index y in mut_vector (which is equivalent to self.pixels[x][y])
    }

    public fun update_single_pixel(
        self: &mut Board,
        x: u64, // The parameter for the x coordinate of the pixel (0-based)
        y: u64, // The parameter for the y coordinate of the pixel (0-based)
        color: String // The parameter for the color of the pixel (a string representing a hex code)
    ) {
        update_pixel(self, x, y, color); // Call update_pixel with self, x, y and color as arguments
    }

    // Update a rectangular region on the board with a single color
    public fun batch_update_board(
        self: &mut Board,
        top_left_x: u64, // The parameter for the x coordinate of the top left corner of the region (0-based)
        top_left_y: u64, // The parameter for the y coordinate of the top left corner of the region (0-based)
        bottom_right_x: u64, // The parameter for the x coordinate of the bottom right corner of the region (0-based)
        bottom_right_y: u64, // The parameter for the y coordinate of the bottom right corner of the region (0-based)
        color: String // The parameter for the color of the region (a string representing a hex code)
    ) {
        let x = top_left_x; // Initialize a loop counter x
        while (x <= bottom_right_x) { // Loop from top_left_x to bottom_right_x
            let y = top_left_y; // Initialize another loop counter y
            while (y <= bottom_right_y) { // Loop from top_left_y to bottom_right_y
                update_pixel(self, x, y, color); // Call update_pixel with self, x, y and color as arguments
                y = y + 1; // Increment y by 1
            };
            x = x + 1; // Increment x by 1
        };
    }

}
