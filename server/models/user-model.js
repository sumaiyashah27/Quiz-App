const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // Formatted userId with "S" prefix and leading zeros
  userIdNumeric: { type: Number, unique: true }, // Internal numeric ID for auto-increment
  firstName: { type: String, required: true }, 
  lastName: { type: String, required: true }, 
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // Email validation regex
  },
  countryCode: { type: String, required: true },  // Country code for phone number
  phone: { type: String, required: true },  // Phone number without country code
  fullPhoneNumber: { type: String, required: true },  // Complete phone number (country code + phone)
  password: { type: String, required: true }
}, { timestamps: true });

// Automatically generate a numeric userId starting from 1
userSchema.plugin(AutoIncrement, { inc_field: 'userIdNumeric', id: 'userIdSeq', start_seq: 1 });

// Pre-save hook to hash the password and set formatted userId
userSchema.pre('save', async function (next) {
  // Hash the password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Format userId with "S" prefix and leading zeros if userIdNumeric exists
  if (this.userIdNumeric) {
    this.userId = `S${String(this.userIdNumeric).padStart(3, '0')}`;
  }

  // Combine countryCode and phone into fullPhoneNumber before saving
  if (this.countryCode && this.phone) {
    this.fullPhoneNumber = `${this.countryCode}${this.phone}`;
  }

  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  console.log(`Entered password: ${enteredPassword}`);
  console.log(`Stored hashed password: ${this.password}`);
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log(`Password match: ${isMatch}`);
  return isMatch;
};

module.exports = mongoose.model('User', userSchema);