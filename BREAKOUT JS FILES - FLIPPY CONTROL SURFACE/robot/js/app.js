$(function(){
	$("#grabber").draggable({ containment: "parent", revert: true, revertDuration: 10 });
	//
	$("#grabber").bind('drag', function (evt) {
		//
		var vertpos = $( evt.target ).position().top;
		var horzpos = $( evt.target ).position().left;
		var accel_dir = '';
		var steer_dir = '';
		var steer_val = 0;
		//
		if ( horzpos < 120 ) {
			steer_dir = 'LEFT';
			steer_val = getScaledValue(horzpos, 120, 0, 0, 0.3, true);
		} else if ( horzpos > 150 ) {
			steer_dir = 'RIGHT';
			steer_val = getScaledValue(horzpos, 150, 270, 0, 0.3, true);
		} else {
			steer_dir = 'STRAIGHT';
		}
		//
		if ( vertpos <= 230 ) {
			accel_dir = 'FORWARD';
		} else if ( vertpos >= 250 ) {
			accel_dir = 'REVERSE';
		} else {
			accel_dir = 'IDLE';
		}
		//
		//console.log(accel_dir);
		//
		var MotorA = motorAccelerate( vertpos, accel_dir, steer_dir, steer_val ).speedA;
		var MotorB = motorAccelerate( vertpos, accel_dir, steer_dir, steer_val ).speedB;
		//
		if ( accel_dir == 'FORWARD' || accel_dir == 'REVERSE' ) {
			if ( accel_dir =='FORWARD' ) {
				console.log( 'FORWARD ----- MOTOR A: ' + MotorA + '  |  MOTOR B: ' + MotorB );
				ROBOT.robotFroward(MotorA, MotorB);
			}
			if ( accel_dir == 'REVERSE' ) {
				console.log( 'REVERSE ----- MOTOR A: ' + MotorA + '  |  MOTOR B: ' + MotorB );
				ROBOT.robotReverse(MotorA, MotorB);
			}
		} else {
			//console.log( 'MOTOR A: ' + 0 + '  |  MOTOR B: ' + 0 );
			ROBOT.robotStop();
		}
		//
	} );
	//
	$( window ).bind('dragstop', function (evt) {
		console.log( 'MOTOR A: ' + 0 + '  |  MOTOR B: ' + 0 );
		ROBOT.robotStop();
	} );
	//
	$("#eyes_bar").bind('click', function (evt) {
		ROBOT.toggleEyes();
	});
	//
	$("#spin_lft").bind('touchstart', function (evt) {
		ROBOT.robotSpinLeft();
	});
	$("#spin_lft").bind('touchend', function (evt) {
		ROBOT.robotStop();
	});
	//
	$("#spin_rgt").bind('touchstart', function (evt) {
		ROBOT.robotSpinRight();
	});
	$("#spin_rgt").bind('touchend', function (evt) {
		ROBOT.robotStop();
	});
	//
	ROBOT.initiateArduino();
});
//
function motorAccelerate ( val, dir, str, pct ) {
	var motorA  = 0;
	var motorB  = 0;
	var thresh = { min: 0, max: 0 };
	var max_speed = 0;
	if ( dir == 'FORWARD' ) {
		max_speed = 1
		thresh.min = 250;
		thresh.max = 0;
	} else if ( dir == 'REVERSE' ) {
		max_speed = 0.2
		thresh.min = 270;
		thresh.max = 315;
	}
	//
	var working_scale = getScaledValue ( val, thresh.min, thresh.max, 0, max_speed, true );
	//
	if ( str == 'LEFT' ) {
		motorA = working_scale-( pct*( working_scale ) );
		motorB = working_scale;
	} else if ( str == 'RIGHT' ) {
		motorA = working_scale;
		motorB = working_scale-( pct*( working_scale ) );
	} else if ( str == 'STRAIGHT') {
		motorA = working_scale;
		motorB = working_scale;
	}
	//
	return {speedA: motorA, speedB: motorB};
}
//
function getScaledValue ( val, inMin, inMax, outMin, outMax, limiter ) {
	var inRange = inMax - inMin;
	var outRange = outMax - outMin;
	var normalVal = (val - inMin) / inRange;
	if (limiter) {
		normalVal = Math.max(0, Math.min(1, normalVal));
	}
	return outRange * normalVal + outMin;
}
//
function setUpArduino(){
	arduino.setDigitalPinMode(13, Pin.DOUT);
	eyes = arduino.getDigitalPin(13);
}
//
var ROBOT = {
	//
	arduino: null,
	Pin: BO.Pin,
	IOBoard: BO.IOBoard,
	IOBoardEvent: BO.IOBoardEvent,
	//
	eye_lft: null,
	eye_rgt: null,
	blink_lft: null,
	blink_rgt: null,
	eyes_on: false,
	//
	motor_a: null,
	motor_b: null,
	power_a: null,
	power_b: null,
	//
	dance: null,
	sing: null,
	//
	initiateArduino: function () {
		ROBOT.arduino = new ROBOT.IOBoard("10.0.1.81", 8887);
		ROBOT.arduino.addEventListener(ROBOT.IOBoardEvent.READY, ROBOT.onArduinoReady);
		console.log("Arduino Initaited...");
	},
	//
	onArduinoReady: function () {
		ROBOT.arduino.removeEventListener(ROBOT.IOBoardEvent.READY, ROBOT.onArduinoReady);
		ROBOT.setUpArduino();
		console.log("Arduino Ready...");
	},
	//
	setUpArduino: function () {
		//Eyes
		ROBOT.arduino.setDigitalPinMode(2, ROBOT.Pin.DOUT); //Left Eye Pin
		ROBOT.arduino.setDigitalPinMode(4, ROBOT.Pin.DOUT); //Right Eye Pin
		ROBOT.eye_lft = ROBOT.arduino.getDigitalPin(2);
		ROBOT.eye_rgt = ROBOT.arduino.getDigitalPin(4);
		//
		//Motors
		ROBOT.arduino.setDigitalPinMode(12, ROBOT.Pin.DOUT); //Motor A Dir Pin
		ROBOT.arduino.setDigitalPinMode(13, ROBOT.Pin.DOUT); //Motor B Dir Pin
		ROBOT.arduino.setDigitalPinMode(3, ROBOT.Pin.PWM); //Motor A PWM Pin
		ROBOT.arduino.setDigitalPinMode(11, ROBOT.Pin.PWM); //Motor B PWM Pin
		ROBOT.arduino.setDigitalPinMode(9, ROBOT.Pin.DOUT); //Motor A Brake Pin
		ROBOT.arduino.setDigitalPinMode(8, ROBOT.Pin.DOUT); //Motor B Brake Pin
		ROBOT.motor_a = ROBOT.arduino.getDigitalPin(12);
		ROBOT.motor_b = ROBOT.arduino.getDigitalPin(13);
		ROBOT.power_a = ROBOT.arduino.getDigitalPin(3);
		ROBOT.power_b = ROBOT.arduino.getDigitalPin(11);
		ROBOT.break_a = ROBOT.arduino.getDigitalPin(9);
		ROBOT.break_b = ROBOT.arduino.getDigitalPin(8);
		//
		//Voice
		ROBOT.arduino.setDigitalPinMode(5, ROBOT.Pin.DOUT);
		ROBOT.arduino.setDigitalPinMode(6, ROBOT.Pin.DOUT);
		ROBOT.dance = ROBOT.arduino.getDigitalPin(5);
		ROBOT.sing = ROBOT.arduino.getDigitalPin(6);
		//
		console.log("Arduino Set Up...");
		ROBOT.toggleEyes();
	},
	//
	toggleEyes: function () {
		if (!ROBOT.eyes_on) {
			ROBOT.eye_lft.value = ROBOT.Pin.HIGH;
			ROBOT.eye_rgt.value = ROBOT.Pin.HIGH;
			ROBOT.eyes_on = true;
		}else{
			ROBOT.eye_lft.value = ROBOT.Pin.LOW;
			ROBOT.eye_rgt.value = ROBOT.Pin.LOW;
			ROBOT.eyes_on = false;
		}
	},
	//
	robotFroward: function ( motorA, motorB ) {
		//console.log(ROBOT.power_b._value);
		ROBOT.break_a.value = ROBOT.Pin.LOW;
		ROBOT.break_b.value = ROBOT.Pin.LOW;
		ROBOT.motor_a.value = 1;
		ROBOT.motor_b.value = 1;
		ROBOT.power_a.value = motorA;
		ROBOT.power_b.value = motorB;
	},
	//
	robotReverse: function ( motorA, motorB ) {
		ROBOT.break_a.value = ROBOT.Pin.LOW;
		ROBOT.break_b.value = ROBOT.Pin.LOW;
		ROBOT.motor_a.value = 0;
		ROBOT.motor_b.value = 0;
		ROBOT.power_a.value = motorA;
		ROBOT.power_b.value = motorB;
	},
	robotStop: function ( motorA, motorB ) {
		ROBOT.break_a.value = ROBOT.Pin.HIGH;
		ROBOT.break_b.value = ROBOT.Pin.HIGH;
		ROBOT.motor_a.value = 0;
		ROBOT.motor_b.value = 0;
		ROBOT.power_a.value = 0;
		ROBOT.power_b.value = 0;
	},
	robotSpinLeft: function () {
		console.log('spin left');
		ROBOT.break_a.value = ROBOT.Pin.LOW;
		ROBOT.break_b.value = ROBOT.Pin.LOW;
		ROBOT.motor_a.value = -1;
		ROBOT.motor_b.value = 1;
		ROBOT.power_a.value = 1;
		ROBOT.power_b.value = 1;
	},
	robotSpinRight: function () {
		console.log('spin right');
		ROBOT.break_a.value = ROBOT.Pin.LOW;
		ROBOT.break_b.value = ROBOT.Pin.LOW;
		ROBOT.motor_a.value = 1;
		ROBOT.motor_b.value = -1;
		ROBOT.power_a.value = 1
		ROBOT.power_b.value = 1;
	},
}