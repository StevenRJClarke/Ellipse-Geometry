//Remove collapse
$('.collapse').off();



(function() {

  //Model
  var data = {
    numClick: 0,
    steps: ['Step 1: Click on the canvas to start your ellipse.', 'Step 2: Click again to choose the size of your ellipse.'],
    points: [0, 0, 0, 0],
    canvasOrigin: [0, 0, 0, 0],
    pixels: [0, 0, 0, 0],
    radiusX: 0,
    radiusY: 0,
    pixelWidth: 15,
    semiMajor: 0,
    semiMinor: 0,
    major: 0,
    minor: 0,
    area: 0
  };

  //Controller
  var controller = {
    getMouseClicks: function(canvasElement, event) {
      let rect;

      //First click
      data.numClick++;

      if(data.numClick == 1) {
        //Get area of canvas relative to viewport
        //on click
        rect = canvasElement.getBoundingClientRect();
        data.canvasOrigin[0] = rect.left;
        data.canvasOrigin[1] = rect.top;

        //Put x and y coordinates of first click
        //into first two elements of points array
        //(in pixels)
        data.points[0] = event.x;
        data.points[1] = event.y;

        //Find the coordinates of the points relative
        //to the origin of the canvas
        data.pixels[0] = data.points[0] - data.canvasOrigin[0];
        data.pixels[1] = data.points[1] - data.canvasOrigin[1];
      }

      //Second click
      if(data.numClick == 2) {
        //Get area of canvas relative to viewport
        //on click
        rect = canvasElement.getBoundingClientRect();
        data.canvasOrigin[2] = rect.left;
        data.canvasOrigin[3] = rect.top;

        //Put x and y coordinates of second click
        //into third and fourth elements of points
        //array (in pixels)
        data.points[2] = event.x;
        data.points[3] = event.y;

        //Find the coordinates of the points relative
        //to the origin of the canvas
        data.pixels[2] = data.points[2] - data.canvasOrigin[2];
        data.pixels[3] = data.points[3] - data.canvasOrigin[3];

        //Calculate the points required to draw the ellipse from
        //the two points (using the canvas units)
        this.getEllipsePointsFromClicks();

        //Reset to 0 clicks
        data.numClick = 0;
      }
    },

    showStep: function() {
      //Show next step
      intro.nextStep(data.steps, data.numClick);
    },

    getEllipsePointsFromClicks: function() {
      let centerX, centerY, startX, startY, pointX, pointY;

      //Convert the pixels into a unit by scaling (/15)

      //The first click gives the center of the ellipse
      //(in canvas units)
      centerX = Math.round((data.pixels[0])/data.pixelWidth);
      centerY = Math.round((data.pixels[1])/data.pixelWidth);

      //The second click defines the semi-major and semi-minor axis

      //The second point (in canvas units)
      pointX = Math.round((data.pixels[2])/data.pixelWidth);
      pointY = Math.round((data.pixels[3])/data.pixelWidth);

      //Find the vertical and horizontal radius of the ellipse
      data.radiusX = Math.abs(centerX - pointX);
      data.radiusY = Math.abs(centerY - pointY);

      //Determine which is the semi-major and which the semi-minor
      //axis by seeing which is longer
      if(data.radiusY < data.radiusX) {
        data.semiMajor = data.radiusX;
        data.semiMinor = data.radiusY;
      } else {
        data.semiMajor = data.radiusY;
        data.semiMinor = data.radiusX;
      }

      //Output the semi-major and semi-minor axes
      semiMajor.showSemiMajor(data.semiMajor);
      semiMinor.showSemiMinor(data.semiMinor);

      //Calculate the major and minor axes
      this.calculateMajor();
      this.calculateMinor();

      //Calculate the area
      this.calculateArea()
    },

    drawEllipse: function(e) {
      canvas.drawEllipse(data.numClick, data.canvasOrigin, data.points, data.pixels, e);
    },

    drawEllipseFromBox() {
      canvas.drawEllipseFromBox(data.semiMajor, data.semiMinor, data.pixelWidth);
    },

    getSemisFromBox: function(sMajor, sMinor, e) {
      //User defines the semi-major and semi-minor axes
      data.semiMajor = sMajor;
      data.semiMinor = sMinor;

      //Show the semi-major and semi-minor axes
      semiMajor.showSemiMajor(data.semiMajor);
      semiMinor.showSemiMinor(data.semiMinor);

      //Calculate the major axes
      this.calculateMajor();
      this.calculateMinor();

      //Calculate the area
      this.calculateArea()

      //Draw ellipse
      this.drawEllipseFromBox();
    },

    validateGroupedInputs: function(type) {
      //Check the semi-major and semi-minor inputs
      if(type == 'semi') {
        let isSemiMajorEmpty = semiMajor.semiMajorAxisBox.value == '';
        let isSemiMinorEmpty = semiMinor.semiMinorAxisBox.value == '';

        //If both inputs are empty...
        if(isSemiMajorEmpty && isSemiMinorEmpty) {
          //No formatting on either input
          semiMajor.semiMajorAxisBox.classList.remove('required');
          semiMajor.semiMajorAxisBox.removeAttribute('placeholder');
          semiMinor.semiMinorAxisBox.classList.remove('required');
          semiMinor.semiMinorAxisBox.removeAttribute('placeholder');

          //Clear the canvas and area
          canvas.clear();
          area.clear();
        }
        //If only one input is empty...
        else if(!isSemiMajorEmpty && isSemiMinorEmpty) {
          //Format the empty input so that it has a
          //red border and says 'Required'
          semiMinor.semiMinorAxisBox.classList.add('required');
          semiMinor.semiMinorAxisBox.setAttribute('placeholder', 'Required');

          //Clear the canvas and area
          canvas.clear();
          area.clear();
        }
        else if (isSemiMajorEmpty && !isSemiMinorEmpty) {
          semiMajor.semiMajorAxisBox.classList.add('required');
          semiMajor.semiMajorAxisBox.setAttribute('placeholder', 'Required');

          //Clear the canvas and area
          canvas.clear();
          area.clear();
        }
        //If neither input is empty...
        else {
          //No formatting on either input
          semiMajor.semiMajorAxisBox.classList.remove('required');
          semiMajor.semiMajorAxisBox.removeAttribute('placeholder');
          semiMinor.semiMinorAxisBox.classList.remove('required');
          semiMinor.semiMinorAxisBox.removeAttribute('placeholder');

          //Allow the inputs to be used
          return true
        }
      }

      //Check the major and minor inputs
      if(type == 'not-semi') {
        let isMajorEmpty = major.majorAxisBox.value == '';
        let isMinorEmpty = minor.minorAxisBox.value == '';

        //If both inputs are empty...
        if(isMajorEmpty && isMinorEmpty) {
          //No formatting on either input
          major.majorAxisBox.classList.remove('required');
          major.majorAxisBox.removeAttribute('placeholder');
          minor.minorAxisBox.classList.remove('required');
          minor.minorAxisBox.removeAttribute('placeholder');

          //Clear the canvas and area
          canvas.clear();
          area.clear();
        }
        //If only one input is empty...
        else if(!isMajorEmpty && isMinorEmpty) {
          //Format the empty input so that it has a
          //red border and says 'Required'
          minor.minorAxisBox.classList.add('required');
          minor.minorAxisBox.setAttribute('placeholder', 'Required');

          //Clear the canvas and area
          canvas.clear();
          area.clear();
        }
        else if (isMajorEmpty && !isMinorEmpty) {
          major.majorAxisBox.classList.add('required');
          major.majorAxisBox.setAttribute('placeholder', 'Required');

          //Clear the canvas and area
          canvas.clear();
          area.clear();
        }
        //If neither input is empty...
        else {
          //No formatting on either input
          major.majorAxisBox.classList.remove('required');
          major.majorAxisBox.removeAttribute('placeholder');
          minor.minorAxisBox.classList.remove('required');
          minor.minorAxisBox.removeAttribute('placeholder');

          //Allow the inputs to be used
          return true
        }
      }
    },

    calculateMajor: function() {
      //major = 2*semi-major
      data.major = 2*data.semiMajor;

      //Output the semi-major axis
      major.showMajor(data.major);
    },

    calculateMinor: function() {
      //minor = 2*semi-minor
      data.minor = 2*data.semiMinor;

      //Output the semi-minor axis
      minor.showMinor(data.minor);
    },

    calculateArea: function() {
      //A = πab
      data.area = this.roundDecimal(Math.PI*data.semiMajor*data.semiMinor, 2);

      //Output the area
      area.showArea(data.area);
    },

    //This is a utility to round functions
    //to a decimal place
    roundDecimal: function(number, precision) {
      //Find power of 10 to appropriate number
      //of decimal places (e.g. if want to round
      //to 2 d.p, find 10^2)
      const factor = Math.pow(10, precision);

      //Multiply number by the power of 10 so the
      //decimal place to be rounded is the unit
      let tempValue = number*factor;

      //Round the number to the nearest unit
      tempValue = Math.round(tempValue);

      //Divide by the power of 10 to make the
      //unit the appropriate decimal place again
      return tempValue/factor;
    },

    clear: function() {
      intro.clear(data.steps);
      canvas.clear();
      semiMajor.clear();
      semiMinor.clear();
      major.clear();
      minor.clear();
      area.clear();
    },

    init: function() {
      intro.init(data.steps);
      canvas.init();
      semiMajor.init();
      semiMinor.init();
      major.init();
      minor.init();
      area.init();
      clear.init();
    }
  };

  //View

  //Intro view
  var intro = {
    init: function(steps) {
      //Get step element
      this.step = document.querySelector('.instruction-step');

      //Show the first step
      this.step.innerText = steps[0];
    },

    nextStep: function(steps, clicks) {
      //Go to next step
      this.step.innerText = steps[clicks];
    },

    clear: function(steps) {
      this.step.innerText = steps[0];
    }
  };

  //Canvas view
  var canvas = {
    init: function() {
      //Get canvas elements
      this.canvasElement = document.getElementById('canvas');
      this.context = this.canvasElement.getContext('2d');

      //Clear canvas
      this.clear();

      //Add a 'click' event listener to canvas
      this.canvasElement.addEventListener('click', function(e) {
        controller.getMouseClicks(this, e);
        controller.showStep();
        controller.drawEllipse();
      })

      //Add a 'mousemove' event listener to canvas
      this.canvasElement.addEventListener('mousemove', function(e) {
        controller.drawEllipse(e);
      })
    },

    clear: function() {
      this.context.beginPath();
      this.context.rect(0, 0, 500, 500);
      this.context.closePath();
      this.context.fillStyle = '#f9f9f9';
      this.context.fill();
    },

    drawEllipse: function(clicks, origins, points, pixels, e) {
      let rX, rY;

      if(clicks == 1) {
        //Clear canvas
        this.clear();

        //Draw center on click
        this.context.beginPath();
        this.context.arc(pixels[0], pixels[1], 5, 0, 2*Math.PI);
        this.context.closePath();
        this.context.fillStyle = '#000000';
        this.context.fill();

        //Use 'mousemove' event to draw ellipse up to
        //cursor

        rX = Math.abs(e.x - points[0]);
        rY = Math.abs(e.y - points[1]);

        this.context.beginPath();
        this.context.ellipse(pixels[0], pixels[1], rX, rY, 0*Math.PI/180, 0, 2*Math.PI);
        this.context.closePath();
        this.context.fillStyle = '#2476C0';
        this.context.fill();

        //But keep the center
        this.context.beginPath();
        this.context.arc(pixels[0], pixels[1], 5, 0, 2*Math.PI);
        this.context.closePath();
        this.context.fillStyle = '#000000';
        this.context.fill();

        //Draw point on cursor
        this.context.beginPath();
        this.context.arc(e.x - origins[0], e.y - origins[1], 5, 0, 2*Math.PI);
        this.context.closePath();
        this.context.fillStyle = '#000000';
        this.context.fill();

        //Draw lines from cursor to ellipse
        this.context.beginPath();
        //Second click up and to right of first click
        if(e.x > points[0] && e.y < points[1]) {
          this.context.moveTo(pixels[0], pixels[1] - rY);
          this.context.lineTo(e.x - origins[0] - 5, e.y - origins[1]);
          this.context.moveTo(e.x - origins[0], e.y - origins[1] + 5);
          this.context.lineTo(e.x - origins[0], e.y - origins[1] + rY);
        }
        //Second click down and to right of first click
        else if(e.x > points[0] && e.y > points[1]) {
          this.context.moveTo(pixels[0], pixels[1] + rY);
          this.context.lineTo(e.x - origins[0] - 5, e.y - origins[1]);
          this.context.moveTo(e.x - origins[0], e.y - origins[1] - 5);
          this.context.lineTo(e.x - origins[0], e.y - origins[1] - rY);
        }
        //Second click up and to left of first click
        else if(e.x < points[0] && e.y < points[1]) {
          this.context.moveTo(pixels[0], pixels[1] - rY);
          this.context.lineTo(e.x - origins[0] + 5, e.y - origins[1]);
          this.context.moveTo(e.x - origins[0], e.y - origins[1] + 5);
          this.context.lineTo(e.x - origins[0], e.y - origins[1] + rY);
        }
        //Second click down and to right of first click
        else {
          this.context.moveTo(pixels[0], pixels[1] + rY);
          this.context.lineTo(e.x - origins[0] + 5, e.y - origins[1]);
          this.context.moveTo(e.x - origins[0], e.y - origins[1] - 5);
          this.context.lineTo(e.x - origins[0], e.y - origins[1] - rY);
        }
        this.context.closePath();
        this.context.strokeStyle = '#ff0000';
        this.context.stroke();
      }
    },

    drawEllipseFromBox: function(semiMajor, semiMinor, pixelWidth) {
      //Clear canvas
      this.clear();

      //Draw ellipe centered at center of canvas
      this.context.beginPath();
      this.context.ellipse(250, 250, semiMajor*pixelWidth, semiMinor*pixelWidth, 0*Math.PI/180, 0, 2*Math.PI);
      this.context.closePath();
      this.context.fillStyle = '#2476C0';
      this.context.fill();
    }
  }

  //Semi-major axis view
  var semiMajor = {
    init: function() {
      //Get input element
      this.semiMajorAxisBox = document.querySelector('input[name=\'semi-major-axis\']');

      //Add event listener to input
      this.semiMajorAxisBox.addEventListener('input', function(e) {
        //Clear major and minor inputs
        major.clear();
        minor.clear();

        //Check that both inputs have values
        if(controller.validateGroupedInputs('semi')) {
          //Use the inputs
          controller.getSemisFromBox(this.value, semiMinor.semiMinorAxisBox.value, e);
        }
      })
    },

    showSemiMajor: function(semiMajor) {
      this.semiMajorAxisBox.value = semiMajor;
    },

    clear: function() {
      this.semiMajorAxisBox.value = '';
    }
  };

  //Semi-minor axis view
  var semiMinor = {
    init: function() {
      //Get input element
      this.semiMinorAxisBox = document.querySelector('input[name=\'semi-minor-axis\']');

      //Add event listener to input
      this.semiMinorAxisBox.addEventListener('input', function(e) {
        //Clear major and minor inputs
        major.clear();
        minor.clear();

        //Check that both inputs have values
        if(controller.validateGroupedInputs('semi')) {
          //Use the inputs
          controller.getSemisFromBox(semiMajor.semiMajorAxisBox.value, this.value, e);
        }
      })
    },

    showSemiMinor: function(semiMinor) {
      this.semiMinorAxisBox.value = semiMinor;
    },

    clear: function() {
      this.semiMinorAxisBox.value = '';
    }
  };

    //Major axis view
    var major = {
      init: function() {
      //Get input element
      this.majorAxisBox = document.querySelector('input[name=\'major-axis\']');

      //Add event listener to input
      this.majorAxisBox.addEventListener('input', function(e) {
        //Clear semi-major and semi-minor inputs
        semiMajor.clear();
        semiMinor.clear();

        //Check that both inputs have values
        if(controller.validateGroupedInputs('not-semi')) {
          //Use the inputs
          controller.getSemisFromBox(this.value/2, minor.minorAxisBox.value/2, e);
        }
      })
    },

    showMajor: function(major) {
      this.majorAxisBox.value = major;
    },

    clear: function() {
      this.majorAxisBox.value = '';
    }
  };

  //Minor axis view
  var minor = {
    init: function() {
      //Get input element
      this.minorAxisBox = document.querySelector('input[name=\'minor-axis\']');

      //Add event listener to input
      this.minorAxisBox.addEventListener('input', function(e) {
        //Clear semi-major and semi-minor inputs
        semiMajor.clear();
        semiMinor.clear();

        //Check that both inputs have values
        if(controller.validateGroupedInputs('not-semi')) {
          //Use the inputs
          controller.getSemisFromBox(major.majorAxisBox.value/2, this.value/2, e);
        }
      })
    },

    showMinor: function(minor) {
      this.minorAxisBox.value = minor;
    },

    clear: function() {
      this.minorAxisBox.value = '';
    }
  };

  //Area view
  var area = {
    init: function() {
      //Get input element
      this.areaBox = document.querySelector('input[name=\'area\']');
    },

    showArea: function(area) {
      this.areaBox.value = area;
    },

    clear: function() {
      this.areaBox.value = '';
    }
  };

  var clear = {
    init: function() {
      this.clearButton = document.querySelector('.clear-button');

      //Add event listener
      this.clearButton.addEventListener('click', function() {
        controller.clear()
      })
    }
  }

  controller.init();

}());