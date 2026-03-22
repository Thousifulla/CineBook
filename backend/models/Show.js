const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
    {
        seatId: { type: String, required: true },
        row: { type: String, required: true },
        number: { type: Number, required: true },

        type: {
            type: String,
            enum: ['regular', 'premium', 'vip'],
            default: 'regular'
        },

        isBooked: {
            type: Boolean,
            default: false
        }

    },
    { _id: false }
);


const theaterSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String, required: true },
        city: { type: String, required: true },
        screen: { type: String, required: true }
    },
    { _id: false }
);


const showSchema = new mongoose.Schema(

    {
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: [true, 'Movie ID is required']
        },

        theater: {
            type: theaterSchema,
            required: true
        },

        showTime: {
            type: Date,
            required: [true, 'Show time is required']
        },

        seatLayout: {
            type: [seatSchema],
            default: []
        },

        seatPricing: {
            regular: { type: Number, default: 200, min: 0 },
            premium: { type: Number, default: 300, min: 0 },
            vip: { type: Number, default: 400, min: 0 }
        },

        totalSeats: {
            type: Number,
            default: 120
        },

        availableSeats: {
            type: Number,
            default: 120
        },

        isActive: {
            type: Boolean,
            default: true
        },

        language: {
            type: String,
            default: 'English'
        },

        format: {
            type: String,
            enum: ['2D', '3D', 'IMAX', '4DX'],
            default: '2D'
        }

    },

    { timestamps: true }

);



/*
 AUTO GENERATE SEAT LAYOUT
*/
showSchema.pre('save', function (next) {

    if (this.seatLayout.length === 0) {

        const layout = [];

        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatsPerRow = 12;

        rows.forEach((row, rowIndex) => {

            for (let n = 1; n <= seatsPerRow; n++) {

                let type = 'regular';

                if (rowIndex < 2) {
                    type = 'vip';
                }
                else if (rowIndex < 5) {
                    type = 'premium';
                }

                layout.push({
                    seatId: `${row}${n}`,
                    row,
                    number: n,
                    type,
                    isBooked: false
                });

            }

        });

        this.seatLayout = layout;
        this.totalSeats = layout.length;
        this.availableSeats = layout.length;

    }

    next();

});



/*
 INDEXES FOR FAST SEARCH
*/
showSchema.index({ movieId: 1, showTime: 1 });
showSchema.index({ 'theater.city': 1 });



module.exports = mongoose.model('Show', showSchema);