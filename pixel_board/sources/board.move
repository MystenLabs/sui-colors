// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module pixel_board::board {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use std::vector;

    use pixel_board::pixel::Pixel;

    struct Board has key { 
        id: UID,
        dimension_x: u64,
        dimension_y: u64,
        pixels: vector<vector<Pixel>>
    }

    public fun create_board(
        dimension: u64,
        ctx: &mut TxContext
    ) {
        let pixels = vector::empty<vector<Pixel>>();
        let i = 0;
        let loops = 10;

        while (i < loops) {
            vector::insert(&mut pixels, vector::empty<Pixel>(), i);
            i = i + 1;
        };

        transfer::share_object(
            Board {
                id: object::new(ctx), 
                dimension_x: dimension,
                dimension_y: dimension,
                pixels
            }
        );
    }

    public fun add_or_update_board(
        self: &mut Board,
        x: u64,
        y: u64,
        pixel: Pixel,
        _ctx: &mut TxContext
    ) {
        let mut_vector = vector::borrow_mut(&mut self.pixels, x);
        *vector::borrow_mut(mut_vector, y) = pixel;
    }

}
