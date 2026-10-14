import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, 'Subscription price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP'],
      default: 'USD',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: [true, 'Subscription frequency is required'],
      default: 'monthly',
    },
    category: {
      type: String,
      enum: ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'other'],
      required: [true, 'Subscription category is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: (value) => {
          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);
          const maxAllowed = new Date(endOfToday.getTime() + 24 * 60 * 60 * 1000);
          return value <= maxAllowed;
        },
        message: 'Start date must be in the past or today',
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.startDate;
        },
        message: 'Renewal date must be after the start date',
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate renewal date if missing
subscriptionSchema.pre('save', function () {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(this.renewalDate.getDate() + (renewalPeriods[this.frequency] || 30));
  }

  // Auto-update status if renewal date has passed
  if (this.renewalDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;