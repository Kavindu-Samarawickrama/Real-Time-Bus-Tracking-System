// src/validators/userValidator.js
const Joi = require("joi");

const provinces = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];
const roles = ["ntc_admin", "bus_operator", "commuter"];
const statuses = ["active", "inactive", "suspended", "pending"];

// User registration validation
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .lowercase()
    .required()
    .messages({
      "string.alphanum": "Username must contain only alphanumeric characters",
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 30 characters",
    }),

  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
  }),

  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),

  role: Joi.string()
    .valid(...roles)
    .default("commuter"),

  profile: Joi.object({
    firstName: Joi.string().trim().max(50).required().messages({
      "string.max": "First name cannot exceed 50 characters",
    }),

    lastName: Joi.string().trim().max(50).required().messages({
      "string.max": "Last name cannot exceed 50 characters",
    }),

    phone: Joi.string()
      .pattern(/^(\+94|0)[0-9]{9}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Please provide a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567)",
      }),

    address: Joi.object({
      street: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      province: Joi.string()
        .valid(...provinces)
        .optional(),
      postalCode: Joi.string()
        .pattern(/^[0-9]{5}$/)
        .optional()
        .messages({
          "string.pattern.base": "Postal code must be 5 digits",
        }),
    }).optional(),
  }).required(),

  organizationDetails: Joi.object({
    operatorLicense: Joi.string().when("$role", {
      is: "bus_operator",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    companyName: Joi.string().when("$role", {
      is: "bus_operator",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    businessRegNumber: Joi.string().when("$role", {
      is: "bus_operator",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    employeeId: Joi.string().when("$role", {
      is: "ntc_admin",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    department: Joi.string().when("$role", {
      is: "ntc_admin",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    designation: Joi.string().when("$role", {
      is: "ntc_admin",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
  }).optional(),
}).with("password", "confirmPassword");

// User login validation
const loginSchema = Joi.object({
  identifier: Joi.alternatives()
    .try(
      Joi.string().email().lowercase(),
      Joi.string().alphanum().min(3).max(30).lowercase()
    )
    .required()
    .messages({
      "alternatives.match": "Please provide a valid email or username",
    }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// User update validation
const updateSchema = Joi.object({
  profile: Joi.object({
    firstName: Joi.string().trim().max(50).optional(),
    lastName: Joi.string().trim().max(50).optional(),
    phone: Joi.string()
      .pattern(/^(\+94|0)[0-9]{9}$/)
      .optional(),
    address: Joi.object({
      street: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      province: Joi.string()
        .valid(...provinces)
        .optional(),
      postalCode: Joi.string()
        .pattern(/^[0-9]{5}$/)
        .optional(),
    }).optional(),
  }).optional(),

  organizationDetails: Joi.object({
    companyName: Joi.string().optional(),
    businessRegNumber: Joi.string().optional(),
    department: Joi.string().optional(),
    designation: Joi.string().optional(),
  }).optional(),
});

// Password change validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters long",
      "string.pattern.base":
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
  confirmNewPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "New passwords do not match",
    }),
}).with("newPassword", "confirmNewPassword");

// Admin user management validation
const adminUpdateUserSchema = Joi.object({
  role: Joi.string()
    .valid(...roles)
    .optional(),
  status: Joi.string()
    .valid(...statuses)
    .optional(),
  permissions: Joi.object({
    canManageRoutes: Joi.boolean().optional(),
    canManageBuses: Joi.boolean().optional(),
    canViewReports: Joi.boolean().optional(),
    canManageUsers: Joi.boolean().optional(),
    canTrackBuses: Joi.boolean().optional(),
  }).optional(),
});

// Query validation for user listing
const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  role: Joi.string()
    .valid(...roles)
    .optional(),
  status: Joi.string()
    .valid(...statuses)
    .optional(),
  search: Joi.string().trim().min(1).optional(),
  sortBy: Joi.string()
    .valid("createdAt", "username", "email", "role", "status")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateSchema,
  changePasswordSchema,
  adminUpdateUserSchema,
  userQuerySchema,
};
