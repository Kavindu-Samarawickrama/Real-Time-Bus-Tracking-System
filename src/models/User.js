// src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["ntc_admin", "bus_operator", "commuter"],
        message: "Role must be either ntc_admin, bus_operator, or commuter",
      },
      default: "commuter",
    },
    profile: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"],
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxlength: [50, "Last name cannot exceed 50 characters"],
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [
          /^(\+94|0)[0-9]{9}$/,
          "Please enter a valid Sri Lankan phone number",
        ],
      },
      address: {
        street: String,
        city: String,
        province: {
          type: String,
          enum: [
            "Western",
            "Central",
            "Southern",
            "Northern",
            "Eastern",
            "North Western",
            "North Central",
            "Uva",
            "Sabaragamuwa",
          ],
        },
        postalCode: String,
      },
    },
    organizationDetails: {
      // For bus_operator role
      operatorLicense: {
        type: String,
        sparse: true,
        unique: true,
      },
      companyName: String,
      businessRegNumber: String,
      // For ntc_admin role
      employeeId: {
        type: String,
        sparse: true,
        unique: true,
      },
      department: String,
      designation: String,
    },
    permissions: {
      canManageRoutes: { type: Boolean, default: false },
      canManageBuses: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canTrackBuses: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "pending",
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    lockUntil: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index(
  { "organizationDetails.operatorLicense": 1 },
  { sparse: true }
);
userSchema.index({ "organizationDetails.employeeId": 1 }, { sparse: true });

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to set role-based permissions
userSchema.pre("save", function (next) {
  if (!this.isModified("role")) return next();

  switch (this.role) {
    case "ntc_admin":
      this.permissions = {
        canManageRoutes: true,
        canManageBuses: true,
        canViewReports: true,
        canManageUsers: true,
        canTrackBuses: true,
      };
      break;
    case "bus_operator":
      this.permissions = {
        canManageRoutes: false,
        canManageBuses: true,
        canViewReports: true,
        canManageUsers: false,
        canTrackBuses: true,
      };
      break;
    case "commuter":
      this.permissions = {
        canManageRoutes: false,
        canManageBuses: false,
        canViewReports: false,
        canManageUsers: false,
        canTrackBuses: true,
      };
      break;
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we've reached max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours lock
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Method to get full name
userSchema.methods.getFullName = function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
};

// Static method to find active users by role
userSchema.statics.findByRole = function (role, status = "active") {
  return this.find({ role, status });
};

module.exports = mongoose.model("User", userSchema);
