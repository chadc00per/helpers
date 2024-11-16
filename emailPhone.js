const libphonenumber = require('google-libphonenumber');
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const Joi = require('joi');
const { log } = require('../logging');
const { newError } = require('../middleware/errors');

function isEmailorPhone(emailOrPhone) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?(\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
  const isEmail = emailRegex.test(emailOrPhone);
  const isPhone = phoneRegex.test(emailOrPhone);

  if (isEmail) {
    return { type: 'email', value: emailOrPhone };
  } else if (isPhone) {
    const cleanedPhone = emailOrPhone.replace(/(?!^\+)[^\d]/g, '');
    return { type: 'phone', value: cleanedPhone };
  } else {
    throw newError('Invalid email or phone number');
  }
}

function validateEmail(email) {
  const emailSchema = Joi.string().email();
  const { error } = emailSchema.validate(email);
  if (error) {
    throw new Error(`"${email}" is not a valid email.`);
  }
  return { value: email };
}

function formatPhoneNumber(phoneNumber, regionCode = 'US') {
    try {
        if (!phoneNumber) {
            throw new Error('No phone number provided');
        }
        
        const letterToDigitMap = {
            'a': '2', 'b': '2', 'c': '2',
            'd': '3', 'e': '3', 'f': '3',
            'g': '4', 'h': '4', 'i': '4',
            'j': '5', 'k': '5', 'l': '5',
            'm': '6', 'n': '6', 'o': '6',
            'p': '7', 'q': '7', 'r': '7', 's': '7',
            't': '8', 'u': '8', 'v': '8',
            'w': '9', 'x': '9', 'y': '9', 'z': '9'
        };
        const cleanedPhoneNumber = phoneNumber.toLowerCase().replace(/[^0-9a-z]/g, '').replace(/[a-z]/g, letter => letterToDigitMap[letter]);
        if (!cleanedPhoneNumber) {
            throw new Error('Invalid phone number format');
        }

        if (typeof regionCode === 'number') {
            regionCode = phoneUtil.getRegionCodeForCountryCode(regionCode);
            if (!regionCode) {
                throw new Error('Invalid region code');
            }
        }

        const number = phoneUtil.parseAndKeepRawInput(cleanedPhoneNumber, regionCode);
        if (!phoneUtil.isValidNumber(number)) {
            throw newError('Invalid phone number');
        }
        const formattedNumber = phoneUtil.format(number, libphonenumber.PhoneNumberFormat.INTERNATIONAL);
        return { value: formattedNumber };
    } catch (error) {
        log(`Error formatting phone number: ${error.message}`);
        throw error;
    }
}

function formatEmailOrPhone(emailOrPhone) {
  try {
    if (!emailOrPhone) {
      throw newError('Email or phone number is required');
    }

    const result = isEmailorPhone(emailOrPhone);

    if (result.type === 'email') {
      const emailValidation = validateEmail(emailOrPhone);
      if (emailValidation.value) {
        return { value: emailValidation.value, type: 'email' };
      } else {
        throw newError('Invalid email');
      }
    } else if (result.type === 'phone') {
      const phoneValidation = formatPhoneNumber(emailOrPhone, 'US');
      if (phoneValidation.value) {
        return { value: phoneValidation.value, type: 'phone' };
      } else {
        throw newError('Invalid phone number');
      }
    } else {
      throw newError('Invalid email or phone number');
    }
  } catch (error) {
    log(`Error in formatEmailOrPhone: ${error.message}`);
    throw error;
  }
}

module.exports = {
  formatEmailOrPhone,
  formatPhoneNumber,
};
