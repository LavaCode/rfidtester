import { useEffect, useState } from 'react';
import './App.css';
import * as phidget22 from 'phidget22';

const serial1 = 645782
const serial2 = 608719
const server = 8989

function App() {
  const [ tag, setTag ] = useState(null);
  const [ baseTag, setBaseTag ] = useState(null);
  const [ protocol, setProtocol ] = useState(null);
  const [ backgroundColor, setBackgroundColor ] = useState('orange');
  const [ device, setDevice ] = useState();

  useEffect(() => {
    const phidgetConnection = new phidget22.Connection({
      hostname: 'localhost',
      port: server,
    });
  
    phidgetConnection.connect().then(() => {
      console.log('Connected to Phidgets')

      //set 1st sensor
      const rfidSensor = new phidget22.RFID();
      rfidSensor.deviceSerialNumber = serial1;
      //set 2nd sensor
      const rfidSensorBase = new phidget22.RFID();
      rfidSensorBase.deviceSerialNumber = serial2;
      //LED-integration sample
      const outputBase = new phidget22.DigitalOutput();
      outputBase.deviceSerialNumber = serial2;
      outputBase.setChannel(2) //on-board LED
      outputBase.open();

      //read-pout sensor #1
      rfidSensor.onTag = function(tag, protocol) {
        checkTag(tag, protocol, 1)
      };
      //read-out sensor #2
      rfidSensorBase.onTag = function(tag, protocol) {
        checkTag(tag, protocol, 2)
        outputBase.setState(true);
      };

      //sensor #1 cleared
      rfidSensor.onTagLost = function(lostTag) {
        setTag(null);
        setBackgroundColor('orange');
      }
      //sensor #2 cleared
      rfidSensorBase.onTagLost = function(lostTag) {
        setBaseTag(null);
        setBackgroundColor('orange');
        outputBase.setState(false);
      }

      rfidSensor.open().catch(function(err) {
        console.error('Error on sensor: ' + err);
      })
      rfidSensorBase.open().catch(function(err) {
        console.error('Error on sensor: ' + err);
      })
    }).catch(function(err) {
      console.error('Error during connect: ' + err);
    });
  }, []);

  function checkTag(tagId, protocol, device) {
    let tagNumbers = [ '6600b9b20c', '6600b9bba6', '6600b9d9e0', 'AWESOME', 'Rapenburg Plaza' ];
    let backgroundColorSet = [ 'red', 'green', 'blue', 'purple', 'crimson' ];

    if (device === 1) {
      setDevice('Booksensor');
      setTag(tagId);
    } else if (device === 2) {
      setDevice('Basesensor');
      setBaseTag(tagId)
;    }

    for (let i in tagNumbers) {
      if (tagNumbers[i] == tagId) {
        try {        
          setBackgroundColor(backgroundColorSet[i])
        } catch(e) {
          console.error(e);
        }
      }
    }
  }
  
  return (
    <div className="container" style= {{ backgroundColor: `${backgroundColor}`}}>
        { tag === null && baseTag === null ? 
          <div className='tag-text-id intro-text'>
            Waiting to read tag...
          </div>
        :
          <div className='tag-text-id'>
            {device} read: 
            {tag && tag}
            {baseTag && baseTag}
            {protocol}
          </div>
        }
    </div>
  );
}

export default App;