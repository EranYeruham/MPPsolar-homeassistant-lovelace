class SolarCard extends HTMLElement {
  constructor() {
    super();
    this.solarPanelItems = []; // Array to hold references to solar item elements
  }

  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      // Only render once
      this._renderCard();
    } else {
      // Update all dynamic elements
      this._updateElectric();
      this._updateSolar();
    }
    
  }

  _renderCard() 
  {
    // Main container for the card
    this.content = document.createElement("div");
    this.content.style.display = "flex";
    this.content.style.flexDirection = "column"; // Arrange items in a row
    this.content.style.alignItems = "center"; // Align items vertically
    this.content.style.justifyContent = "center"; // Center the content horizontally
    this.content.style.gap = "0px"; // Space between elements
    this.content.style.backgroundColor = "#333333"; // Set a light gray background color
    this.content.style.padding = "16px"; // Add padding
    this.content.style.borderRadius = "12px"; // Optional: Rounded corners
    this.content.style.boxShadow = "0 4px 8px rgba(165, 33, 33, 0.1)"; // Optional: Add shadow

     //#################### Create container for solar icon and rectangle #################### 
    this.topRow = this._createTopRowWithSolarItems();
    this.content.appendChild(this.topRow);

    //####################
    this.lowerContent = document.createElement("div");
    this.lowerContent.style.display = "flex";
    this.lowerContent.style.flexDirection = "row"; // Arrange items vertically
    this.lowerContent.style.alignItems = "center"; // Center items horizontally
    this.lowerContent.style.gap = "0px"; // Space between the circle and rectangle
    this.content.appendChild(this.lowerContent);

    //############################ Create the first circle (left) ################################
    this.electricIcon = this._createIcon(this._config.grid.grid_icon || "mdi:flash");
    this.electricIcon.addEventListener("dblclick", () => this._handleClick(this._config.entity));
    this.lowerContent.appendChild(this.electricIcon);


    //############### Create Line Between Electric Circle and Middle Group #################
    this.line2 = this._createHorizontalLineWithDot(true);
    this.lowerContent.appendChild(this.line2);

    //############## Middle group: a container for the middle circle and rectangle ################
    const middleGroup = document.createElement("div");
    middleGroup.style.display = "flex";
    middleGroup.style.flexDirection = "column"; // Arrange items vertically
    middleGroup.style.alignItems = "center"; // Center items horizontally
    middleGroup.style.gap = "0px"; // Space between the circle and rectangle
   
     // Create the production rectangle
     this.inverterRectangle = this._createHollowRectangle("Production", false, "rgba(241, 82, 8, 0.9)","140px","35px", "25px");
     middleGroup.appendChild(this.inverterRectangle);
     
    //############### Create container for solar icon and rectangle###############
    this.solarContainer = this._createIcon(this._config.solarPowerIcon || "mdi:solar-power");
    middleGroup.appendChild(this.solarContainer);

    //############### Create Line Between Top  and middle Circle #################
    this.solarLine = this._createVerticalLineWithDot();
    middleGroup.appendChild(this.solarLine);

    this.mppSolarImg = this._createIconWithImage();
    middleGroup.appendChild(this.mppSolarImg);

    //############### Create Line Between MIDDLE and battery Circle #################
    this.solarLine = this._createVerticalLineWithDot(true);
    middleGroup.appendChild(this.solarLine);

    //############### Create the battery rectangle ###############
    this.batteryRectangle = this._createHollowRectangle("Battery");
    middleGroup.appendChild(this.batteryRectangle);
    this.lowerContent.appendChild(middleGroup);

    //############### Create Line Between Middle Group and Right Circle #################
    const line = this._createHorizontalLineWithDot(false);
    this.lowerContent.appendChild(line);

    //############## Create the second circle (right) ##############
    this.house = this._createIcon(this._config.house_icon || "mdi:flash");
    this.lowerContent.appendChild(this.house);

    // Append the card content to the custom element
    this.appendChild(this.content);

    //#################### Initial Updates ####################
    this._updateElectric();
    this._updateSolar();
  }

  _createTopRowWithSolarItems() 
  {
    const rowContainer = document.createElement("div");
    rowContainer.style.display = "flex";
    rowContainer.style.justifyContent = "space-around"; // Distribute items evenly
    rowContainer.style.alignItems = "center";
    rowContainer.style.marginBottom = "10px";

    let pvWidth = this._config.PV.pvs_width;
    console.log("pvWidth: ",pvWidth);
    // Generate 8 solar items dynamically
    const items = this._config.PV.inverters_num;

    for (let i = 1; i <= items; i++) 
    {
        const solarItem = document.createElement("div");
        solarItem.style.display = "flex";
        solarItem.style.flexDirection = "column";
        solarItem.style.alignItems = "center";
        solarItem.style.width = `${pvWidth}px`; // Set width for each item
        solarItem.style.textAlign = "center";

        // Create the solar label
        const solarLabel0 = document.createElement("span");
        solarLabel0.textContent = `Solar ${i}`;
        solarLabel0.style.fontSize = "8px"; // Adjust text size
        solarLabel0.style.marginTop = "8px";
        solarItem.appendChild(solarLabel0);

        // Create the solar icon
        const iconSize = this._config.icon_size || 32; 
        const solarIcon = document.createElement("ha-icon");
        solarIcon.setAttribute("icon", "mdi:solar-panel");
        solarIcon.style.fontSize = `${iconSize}px`; // Adjust the size of the icon
        solarIcon.style.color = "#ffcc00"; // Set icon color
        solarItem.appendChild(solarIcon);

        // Create the solar label
        const solarLabel = document.createElement("span");
        solarLabel.textContent = `Solar ${i}`;
        solarLabel.style.fontSize = "8px"; // Adjust text size
        solarLabel.style.marginTop = "8px";
        solarItem.appendChild(solarLabel);

        // Create the solar label
        const solarLabel2 = document.createElement("span");
        solarLabel2.textContent = `Solar ${i}`;
        solarLabel2.style.fontSize = "8px"; // Adjust text size
        solarLabel2.style.marginTop = "8px";
        solarItem.appendChild(solarLabel2);

        // Store the label for dynamic updates
        this.solarPanelItems.push({ label0: solarLabel0, label: solarLabel, label2: solarLabel2, icon: solarIcon, sensorKey: `${i-1}` });

        // Append each solar item to the row container
        rowContainer.appendChild(solarItem);
    }

    return rowContainer;
}
  //####################################################
  //############## _createHollowRectangle ##############
  //####################################################
  _createHollowRectangle(initialText,isBorder=true,color="rgba(238, 131, 9, 0.91)",width="70px",height="30px", fontsize_ = "20px") 
  {
    const rectangle = document.createElement("div");
    rectangle.style.width = width; // Rectangle width
    rectangle.style.height = height; // Rectangle height
    rectangle.style.display = "flex";
    rectangle.style.alignItems = "center";
    rectangle.style.justifyContent = "center";
    rectangle.style.textAlign = "center";
    rectangle.style.borderRadius = "10%"; // Circle shape
    rectangle.style.color = color;

    if(isBorder)
    {
      rectangle.style.border = "1px solid #000"; // Rectangle border
    }
    rectangle.style.fontSize = fontsize_; // Font size
    rectangle.style.cursor = "default"; // No pointer cursor for rectangle
    rectangle.style.borderColor = "#FFFFCC";
    rectangle.style.backgroundColor = "transparent"; // Default background color

    // Add the text
    const text = document.createElement("span");
    text.innerText = initialText;
    text.style.textAlign = "center";
    rectangle.appendChild(text);

    return rectangle;
  }

  //####################################################
  //############## _createVerticalLineWithDot ##################
  //####################################################
  _createVerticalLineWithDot(lowerLine) 
  {
    const speed =0.4;
    
    // Create the line container
    const lineContainer = document.createElement("div");
    lineContainer.style.position = "relative";
    lineContainer.style.width = "2px"; // Line width
    lineContainer.style.height = "70px"; // Line thickness
    lineContainer.style.backgroundColor = "#ccc"; // Line color
    lineContainer.style.margin = "0"; // No margin
    lineContainer.style.overflow = "visible"; // Allow dot visibility

    const solarStateObj = this._hass.states[this._config.pv_power];
    if (!solarStateObj) 
    {
      return lineContainer;
    }
    let pvPower = parseFloat(solarStateObj.state)

    if(pvPower === 0 && !lowerLine)
    {
      lineContainer.style.backgroundColor = "transparent";
      return lineContainer;
    }
      
    // Create the moving dot
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.width = "8px"; // Dot width
    dot.style.height = "8px"; // Dot height
    dot.style.backgroundColor = "#00ff00"; // Dot color
    dot.style.borderRadius = "50%"; // Make it circular
    dot.style.top = "0px"; // Center dot vertically relative to the line
    dot.style.left = "-3px"; // Initial position

    // Append the dot to the line container
    lineContainer.appendChild(dot);

    // Manual animation: Move the dot horizontally
    let position = 0; // Start position
    const maxPosition = 62; // Maximum distance (70px - 8px dot width)
    this.verticalSpeed = .4; // Speed in pixels per frame
    

    const animate = () => {
        if (lowerLine)
        {
          position += this.verticalSpeed; // Increment the position    
        }   
        else
        {
          position += speed;
        }

        if (position > maxPosition ) 
        {
            position = 0; // Reset position when it reaches the end
        }

        if ( position < 0) 
        {
            position = maxPosition; // Reset position when it reaches the end
        }

        dot.style.top = `${position}px`; // Update the dot's position
        requestAnimationFrame(animate); // Request the next frame
    };

    // Start the animation
    animate();

  return lineContainer;
  }

  //####################################################
  //############## _createLineWithDot ##################
  //####################################################
  _createHorizontalLineWithDot(leftLine) 
  {
    let horizontalLineLength = this._config.horizontalLineLength;
    
    // Create the line container
    const lineContainer = document.createElement("div");
    lineContainer.style.position = "relative";
    lineContainer.style.width = `${horizontalLineLength}px`; // Line width
    lineContainer.style.height = "2px"; // Line thickness
    lineContainer.style.backgroundColor = "#ccc"; // Line color
    lineContainer.style.margin = "0"; // No margin
    lineContainer.style.overflow = "visible"; // Allow dot visibility

    
    const gridStateObj = this._hass.states[this._config.grid.grid_import_power];
    if (!gridStateObj) 
    {
      return lineContainer;
    }
    let PowerFromGrid = parseFloat(gridStateObj.state)
    let dotColor = PowerFromGrid === 0 ? "rgba(0, 255, 40, 0.9)" : "rgba(196, 24, 81, 0.9)";
    
    if(PowerFromGrid === 0 && leftLine)
    {
      lineContainer.style.backgroundColor = "transparent";
        return lineContainer;
    }

    // Create the moving dot
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.width = "8px"; // Dot width
    dot.style.height = "8px"; // Dot height
    dot.style.backgroundColor = dotColor; // Dot color
    dot.style.borderRadius = "50%"; // Make it circular
    dot.style.top = "-3px"; // Center dot vertically relative to the line
    dot.style.left = "0px"; // Initial position

    // Append the dot to the line container
    lineContainer.appendChild(dot);

    // Manual animation: Move the dot horizontally
    let position = 0; // Start position
    const maxPosition = parseFloat(horizontalLineLength); // Maximum distance (70px - 8px dot width)
    const speed = .4; // Speed in pixels per frame

    const animate = () => {
        position += speed; // Increment the position
        if (position > maxPosition) {
            position = 0; // Reset position when it reaches the end
        }
        dot.style.left = `${position}px`; // Update the dot's position
        requestAnimationFrame(animate); // Request the next frame
    };

    // Start the animation
    animate();

    return lineContainer;
}

//####################################################
//############## _updateElectric #####################
//####################################################
_updateElectric() 
{
  if (this._hass && this._config.grid.grid_status) 
  {
    const gridStateObj = this._hass.states[this._config.grid.grid_import_power];
    const gridConnectedObj = this._hass.states[this._config.grid.grid_connected];
    if (gridStateObj) 
    {
      let PowerFromGrid = parseFloat(gridStateObj.state)

     // Get the ha-icon element from the container
     const icon = this.electricIcon.querySelector("ha-icon");
     if (icon) 
    {
       //grid icon 
       const iconSize = this._config.icon_size || 32;
       const newIcon = gridConnectedObj.state === "1" ? this._config.grid.grid_icon : this._config.grid.grid_disconected_icon;
       icon.style.color = PowerFromGrid === 0 ? "rgba(0, 255, 40, 0.9)" : "rgba(70, 24, 196, 0.9)";
       icon.style.color = gridConnectedObj.state === "1" ? icon.style.color : "rgba(255, 15, 110, 0.9)";
       icon.style.fontSize = `${iconSize}px`;
       icon.setAttribute ("icon", newIcon);

       //background color of the container if desired
       this.electricIcon.style.backgroundColor = PowerFromGrid === 0 ? "rgba(26, 51, 32, 0.9)" : "rgba(51, 30, 32, 0.9)";
       // You can also change the border color
       //this.electricIcon.style.border = `1px solid ${PowerFromGrid === 0 ? "#00ff28" : "#ff0e6e"}`;
     }

      // Ensure text is displayed separately
      const textSpan = this.electricIcon.querySelector(".state-text");
      if (textSpan) 
        {
          textSpan.innerText = gridStateObj.state+ "w"; // Update state text
          this.electricIcon.style.color = PowerFromGrid === 0 ? "rgba(182, 179, 26, 0.9)"  : "rgba(202, 39, 167, 0.9)";
      } 
      else 
      {
          let font_size = this._config.font_size
          const newTextSpan = document.createElement("span");
          newTextSpan.classList.add("state-text");
          newTextSpan.style.marginLeft = "8px"; // Add space between icon and text
          newTextSpan.style.fontSize = `${font_size}px`; // Optional: Adjust font size
          newTextSpan.innerText = gridStateObj.state + " W";
          this.electricIcon.appendChild(newTextSpan);
          this.electricIcon.style.color = PowerFromGrid === 0 ? "rgba(182, 179, 26, 0.9)" : "rgba(202, 39, 167, 0.9)";
      }
    }
  }
}


  //####################################################
  //############## _updateSolar ########################
  //####################################################
_updateSolar() 
{
  let pvProduction = 0;
  let houseConsumptionPower = 0;

  // Iterate over each solar item and update its text with the sensor value
  this.solarPanelItems.forEach((item) => 
  {
    const sensorId = this._config.PV.power[item.sensorKey];
    const sensorState = this._hass.states[sensorId]; 

    const sensorId2 = this._config.PV.current[item.sensorKey];
    const sensorState2 = this._hass.states[sensorId2]; 

    const sensorId0 = this._config.PV.ids[item.sensorKey];
    const sensorState0 = this._hass.states[sensorId0]; 

    if (sensorState) 
    {
        item.label0.textContent = `${sensorState0.state}`;
        item.label.textContent = `${sensorState.state} ${'W'}`;
        item.label2.textContent = `${sensorState2.state} ${'A'}`;
        let pvPower = parseFloat(sensorState.state);
        
        item.icon.style.color = pvPower > 0 ? "rgba(171, 221, 35, 0.9)" : "rgba(172, 179, 172, 0.9)";
    } 
    else 
    {
        item.label.textContent = "X"; // Fallback text if the sensor is not found
    }
  });


  //set solar today's production
  
  if (this._hass && this._config.today_production) 
  {
    const stateObj = this._hass.states[this._config.today_production];
    if (stateObj) 
    {
      this.inverterRectangle.innerText = stateObj.state + " KWh";
    }
  }

  //set solar all pannels production
  if (this._hass && this._config.pv_power) 
  {
    const pvStateObj = this._hass.states[this._config.pv_power];
    if (pvStateObj) 
    {
      // Define pvProduction 
      const pvProduction = parseFloat(pvStateObj.state) || 0;

      // Get the ha-icon element from the container
      const icon = this.solarContainer.querySelector("ha-icon");
      if (icon) 
      {
        const newIcon = pvProduction > 0 ? this._config.solarPowerIcon : this._config.nightIcon;
        icon.setAttribute ("icon", newIcon);
        // Change icon color based on power value
        icon.style.color = pvProduction > 0 ? "rgba(235, 149, 21, 0.9)" : "rgba(172, 179, 172, 0.9)";
        
        // You can also change the background color of the container if desired
        this.solarContainer.style.backgroundColor = pvProduction > 0 ? "rgba(36, 31, 116, 0.9)"  : "rgba(46, 45, 45, 0.9)" ;
        // You can also change the border color
        //this.electricIcon.style.border = `1px solid ${PowerFromGrid === 0 ? "#00ff28" : "#ff0e6e"}`;
      }


        // pv prduction
        const textSpan = this.solarContainer.querySelector(".state-text");
        if (textSpan) 
        {
            textSpan.innerText = pvStateObj.state + " W"; // Update state text
            this.solarContainer.style.color = pvProduction > 0 ? 
                "rgba(155, 230, 34, 0.9)" : 
                "rgba(119, 129, 124, 0.9)";
        } 
        else 
        {
            let font_size = this._config.font_size
            const newTextSpan = document.createElement("span");
            newTextSpan.classList.add("state-text");
            newTextSpan.style.marginLeft = "10px";
            newTextSpan.style.fontSize = `${font_size}px`;
            newTextSpan.innerText = pvStateObj.state + " W";
            this.solarContainer.appendChild(newTextSpan);
            
            // Set background color
            this.solarContainer.style.backgroundColor = pvProduction > 0 ? 
                "rgba(194, 201, 197, 0.9)" : 
                "rgba(49, 51, 50, 0.9)";
            
            // Set text color
            this.solarContainer.style.color = pvProduction > 0 ? 
                "rgba(10, 202, 170, 0.9)" : 
                "rgba(119, 129, 124, 0.9)";
        }
    }
}

  // set house power conumption
  if (this._hass && this._config.house_consumption) 
  {
    const icon = this.house.querySelector("ha-icon");
    if (icon) 
    {
      //grid icon 
      const iconSize = this._config.icon_size || 12;
      const newIcon = pvProduction > 0 ? this._config.house_icon : "mdi:home-alert-outline";
      icon.style.color = pvProduction > 0 ? "rgba(0, 255, 40, 0.9)" : "rgba(24, 196, 139, 0.9)";
      icon.style.fontSize = `${iconSize}px`;
      icon.setAttribute ("icon", newIcon);

      this.house.style.backgroundColor = pvProduction === 0 ? "rgba(9, 43, 17, 0.9)" : "rgba(47, 35, 70, 0.9)";
    }

    // Ensure text is displayed separately
    const houseObj = this._hass.states[this._config.house_consumption];
    const textSpan = this.house.querySelector(".state-text");
    if (textSpan) 
      {
        textSpan.innerText = `${houseObj.state} ${'W'}`;
        this.house.style.color = pvProduction === 0 ?  "rgba(202, 39, 167, 0.9)" :  "rgba(182, 179, 26, 0.9)";
        houseConsumptionPower = parseFloat(houseObj.state) || 0;
    } 
    else 
    {
        let font_size = this._config.font_size
        const newTextSpan = document.createElement("span");
        newTextSpan.classList.add("state-text");
        newTextSpan.style.marginLeft = "8px"; // Add space between icon and text
        newTextSpan.style.fontSize = `${font_size}px`; // Optional: Adjust font size
        newTextSpan.innerText = `${houseObj.state} ${'W'}`;
        this.house.appendChild(newTextSpan);
        this.house.style.color = pvProduction === 0 ?  "rgba(202, 39, 167, 0.9)" :  "rgba(182, 179, 26, 0.9)";
    }
  }

  //set baterry frame and text color
  if (this.batteryRectangle) 
  {
    let color = "#33B866";
    this.batteryRectangle.innerText = "0 W";
    const pvStateObj = this._hass.states[this._config.pv_power];
    const stateObj = this._hass.states[this._config.grid.grid_import_power];
        
    if(stateObj && pvStateObj)
    {
      const pvProduction = parseFloat(pvStateObj.state) || 0;
      let PowerFromGrid = parseFloat(stateObj.state)

      if(PowerFromGrid === 0)
      {
        if( (pvProduction - houseConsumptionPower) < 0 ) 
        {
            color = "rgba(167, 57, 57, 0.7)";

            //change dot direction
            this.verticalSpeed = -.4;
        }
        this.batteryRectangle.innerText = `${pvProduction - houseConsumptionPower} W`;
      }
      else
      {
        if( (pvProduction ) > 0 )
        {
          this.verticalSpeed = .4;
        }
        else
        {
          this.verticalSpeed = 0;
        }
        color = "rgba(10, 202, 170, 0.9)"
        this.batteryRectangle.innerText = `${pvProduction} W`;
      }
    
      this.batteryRectangle.style.borderColor =  color; 
      this.batteryRectangle.style.color =  color; 
      
    }
  }
}

  //####################################################
  //############## _createIcon ########################
  //####################################################
  _createIcon(iconName) 
  {
    const iconSize = this._config.icon_size || 32; // Default size

    const iconContainer = document.createElement("div");
    iconContainer.style.width = "100px";
    iconContainer.style.height = "100px";
    iconContainer.style.display = "flex";
    iconContainer.style.alignItems = "center";
    iconContainer.style.justifyContent = "center";
    iconContainer.style.backgroundColor = "transparent"; // Add background color
    iconContainer.style.borderRadius = "50%"; // Make it circular
    iconContainer.style.fontSize = `${iconSize}px`;
    //iconContainer.style.border = "1px solid #000"; // Add a border
  
    // Add a style tag specifically for ha-icon
    const style = document.createElement('style');
    style.textContent = `
        ha-icon {
            --mdc-icon-size: ${iconSize}px !important;
            width:  ${iconSize}px !important;
            height:  ${iconSize}px !important;
            font-size:  ${iconSize}px !important;
        }
    `;
    iconContainer.appendChild(style);

    const icon = document.createElement("ha-icon");
    icon.setAttribute("icon", iconName);
    icon.style.width = `${iconSize}px`;
    icon.style.height = `${iconSize}px`;
    icon.style.setProperty('--mdc-icon-size', `${iconSize}px`);
    icon.style.color = "#ffa5f0";
    icon.style.fontSize = `${iconSize}px`;
  
    iconContainer.appendChild(icon);
    return iconContainer;
  }
  
  //####################################################
  //############## _handleClick ########################
  //####################################################
  _handleClick(entity) 
  {
    if (entity) 
    {
      this._hass.callService("homeassistant", "toggle", 
      {
        entity_id: entity,
      });
    }
  }


  //####################################################
  //############## _createIconWithImage ########################
  //####################################################
  _createIconWithImage() 
  {
    const iconContainer = document.createElement("div");
    iconContainer.style.width = "140px";
    iconContainer.style.height = "220px";
    iconContainer.style.display = "flex";
    iconContainer.style.alignItems = "flex-start"; // Aligns content to the top
    iconContainer.style.justifyContent = "center";
    iconContainer.style.backgroundColor = "transparent"; // Optional: background color
    iconContainer.style.borderRadius = "0%"; // Optional: make it circular
    iconContainer.style.overflow = "hidden"; // Ensure the image stays within bounds
    iconContainer.style.paddingTop = "-20px"; // Adds padding to push the content up

    const img = document.createElement("img");
    img.src = "/local/community/eransButton/mppSolar3.jpg";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover"; // Adjust image scaling
    img.alt = "MPP Solar"; // Accessibility text

    iconContainer.appendChild(img);
    return iconContainer;
  }
}
//############ ENF OF CLASS ##########################


// Define the custom element
customElements.define("solar-card", SolarCard);

window.addEventListener('load', () => {
  const mdiStyle = document.createElement("link");
  document.head.appendChild(mdiStyle);
});

