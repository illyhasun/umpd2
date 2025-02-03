const areShiftsOverlapping = (newFrom, newTo, existingFrom, existingTo) => {
    return newFrom <= existingTo && newTo >= existingFrom;
};

const mergeShifts = (shifts) => {
    return shifts.reduce((acc, shift) => {
        const lastShift = acc[acc.length - 1];

        if (lastShift && lastShift.type === shift.type && lastShift.to === shift.from) {
            lastShift.to = shift.to;  // Слияние смен
        } else {
            acc.push(shift);
        }

        return acc;
    }, []);
};