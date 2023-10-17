// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module pixel_board::board {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use std::vector;
    use std::string::{String, utf8};

    struct Board has key { 
        id: UID,
        dimension_x: u64,
        dimension_y: u64,
        pixels: vector<vector<String>>
    }

    public fun create_board(
        dimension: u64,
        ctx: &mut TxContext
    ) {
        let pixels = vector::empty<vector<String>>();
        let i = 0;
        let loops = 100;

        while (i < loops) {
            let tmp_vec = vector::empty<String>();

            let j = 0;
            while (j < loops) {
                vector::insert(&mut tmp_vec, utf8(b"ffffff"), j);
                j = j + 1;
            };

            vector::insert(&mut pixels, tmp_vec, i);
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
        color: String
    ) {
        let mut_vector = vector::borrow_mut(&mut self.pixels, x);
        *vector::borrow_mut(mut_vector, y) = color;
    }

}
