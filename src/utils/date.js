const parseISO = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addMinutes = (date, minutes) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getTime() + minutes * 60000);
};

module.exports = { parseISO, addMinutes };
