exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.checkArray = function (array) {
	if(array.length>0){
     return 1;
	}else{
	 return 0;
	}
}

exports.timeCompare = (min, max, ref) => {
    return (this.timeToNumber(min) <= this.timeToNumber(ref)) && (this.timeToNumber(ref) <= this.timeToNumber(max));
}

exports.timeToNumber = (time_string) => {
	console.log(time_string)
    var hm = time_string.split(":");
    var offset = 0;
    var hours = Number(hm[0]) + offset;
    return hours * 100 + Number(hm[1]);
}

/**Pad leading zero to single digit number.*/
exports.padLeadingZero = (number) => {
	var result = ('0' + number).slice(-2);
	return result;
}

/**Get first date from year and month.*/
exports.getFirstDate = (year, month) => {
	return new Date(year, month, 1).getDate();
}

/**Get last date from year and month.*/
 exports.getLastDate = (year, month) => {
	return new Date(year, month, 0).getDate();
}

/**Convert ISO string date to Local date.*/
exports.ISOToLocalDate = async (date) => {

	var time = new Date(date);
	return new Date(time.getTime() + (time.getTimezoneOffset() * 60000 ));

}

/**Check valid mobile number.*/
exports.ValidateMobileNumber = async (mobile) => {

	var data = new RegExp(/^-?(0|[1-9]\d*)?$/);
	if(data.test(mobile)) {
		return true;
	} else {
		false;
	}

}

/**Check valid email.*/
exports.ValidateEmail = async (email) => {

	var data = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
	if(data.test(email)) {
		return true;
	} else {
		false;
	}

}

/**Asynchronus forEach condition.*/
exports.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}