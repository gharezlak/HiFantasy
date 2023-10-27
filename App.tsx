/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';

import { Slider } from "@miblanchard/react-native-slider";
import { trackMarkStyles, bleStyles, styles } from './styles';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const SECONDS_TO_SCAN_FOR = 3;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = false;

import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

declare module 'react-native-ble-manager' {
  // enrich local contract with custom state properties needed by App.tsx
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

const DEFAULT_VALUE = 0;

const SliderContainer = (props: {
  caption: string;
  children: React.ReactElement;
  sliderValue?: Array<number>;
  trackMarks?: Array<number>;
  vertical?: boolean;
}) => {
  const { caption, sliderValue, trackMarks } = props;
  const [value, setValue] = React.useState(
    sliderValue ? sliderValue : DEFAULT_VALUE,
  );
  let renderTrackMarkComponent: (index: number) => JSX.Element;

  if (trackMarks?.length && (!Array.isArray(value) || value?.length === 1)) {
    renderTrackMarkComponent = (index: number): JSX.Element => {
      const currentMarkValue = trackMarks[index];
      const currentSliderValue =
        value || (Array.isArray(value) && value[0]) || 0;
      const style =
        currentMarkValue > Math.max(currentSliderValue)
          ? trackMarkStyles.activeMark
          : trackMarkStyles.inactiveMark;
      return <View style={style} />;
    };
  }

  const renderChildren = () => {
    return React.Children.map(
      props.children,
      (child: React.ReactElement) => {
        if (!!child && child.type === Slider) {
          return React.cloneElement(child, {
            onValueChange: setValue,
            renderTrackMarkComponent,
            trackMarks,
            value,
          });
        }

        return child;
      },
    );
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.titleContainer}>
        <Text>{caption}</Text>
        <Text>{Array.isArray(value) ? value.join(' - ') : value}</Text>
      </View>
      {renderChildren()}
    </View>
  );
};

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral['id'], Peripheral>(),
  );
  const [connected, setConnected] = useState(false);
  const [booted, setBooted] = useState(false);
  const [selectedTower, setSelectedTower] = useState(null);
  const [customValues, setCustomValues] = useState([0, 0, 0, 0, 0, 0, 0]);

  //console.debug('peripherals map updated', [...peripherals.entries()]);

  const addOrUpdatePeripheral = (id: string, updatedPeripheral: Peripheral) => {
    // new Map() enables changing the reference & refreshing UI.
    // TOFIX not efficient.
    setPeripherals(map => new Map(map.set(id, updatedPeripheral)));
  };

  const startScan = () => {
    if (!isScanning) {
      // reset found peripherals before scan
      setPeripherals(new Map<Peripheral['id'], Peripheral>());

      try {
        //console.debug('[startScan] starting scan...');
        setIsScanning(true);
        BleManager.scan(SERVICE_UUIDS, SECONDS_TO_SCAN_FOR, ALLOW_DUPLICATES, {
          matchMode: BleScanMatchMode.Sticky,
          scanMode: BleScanMode.LowLatency,
          callbackType: BleScanCallbackType.AllMatches,
        })
          .then(() => {
            //console.debug('[startScan] scan promise returned successfully.');
          })
          .catch(err => {
            console.error('[startScan] ble scan returned in error', err);
          });
      } catch (error) {
        console.error('[startScan] ble scan error thrown', error);
      }
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    console.debug('[handleStopScan] scan is stopped.');
  };

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent,
  ) => {
    let peripheral = peripherals.get(event.peripheral);
    if (peripheral) {
      console.debug(
        `[handleDisconnectedPeripheral][${peripheral.id}] previously connected peripheral is disconnected.`,
        event.peripheral,
      );
      addOrUpdatePeripheral(peripheral.id, { ...peripheral, connected: false });
    }
    console.debug(
      `[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`,
    );
  };

  const handleUpdateValueForCharacteristic = (
    data: BleManagerDidUpdateValueForCharacteristicEvent,
  ) => {
    console.debug(
      `[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}'`,
    );
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    // console.debug('[handleDiscoverPeripheral] new BLE peripheral=', peripheral);
    // if (!peripheral.name) {
    //   peripheral.name = 'NO NAME';
    // }
    // addOrUpdatePeripheral(peripheral.id, peripheral);
    const p_name = peripheral?.name;
    if (p_name && p_name == "DSD TECH") {
      addOrUpdatePeripheral(peripheral.id, peripheral);
    }
  };

  const togglePeripheralConnection = async (peripheral: Peripheral) => {
    if (peripheral && peripheral.connected) {
      try {
        await BleManager.disconnect(peripheral.id);
        console.log('running disconnect!');
        setConnected(false);
      } catch (error) {
        console.error(
          `[togglePeripheralConnection][${peripheral.id}] error when trying to disconnect device.`,
          error,
        );
      }
    } else {
      await connectPeripheral(peripheral);
    }
  };

  const retrieveConnected = async () => {
    try {
      const connectedPeripherals = await BleManager.getConnectedPeripherals();
      if (connectedPeripherals.length === 0) {
        console.warn('[retrieveConnected] No connected peripherals found.');
        return;
      }

      console.debug(
        '[retrieveConnected] connectedPeripherals',
        connectedPeripherals,
      );

      for (var i = 0; i < connectedPeripherals.length; i++) {
        var peripheral = connectedPeripherals[i];
        addOrUpdatePeripheral(peripheral.id, { ...peripheral, connected: true });
      }
    } catch (error) {
      console.error(
        '[retrieveConnected] unable to retrieve connected peripherals.',
        error,
      );
    }
  };

  const connectPeripheral = async (peripheral: Peripheral) => {
    try {
      if (peripheral) {
        // console.log('id: ' + peripheral.id);
        // console.log('type: ' + typeof (peripheral.id) + '\n');
        addOrUpdatePeripheral(peripheral.id, { ...peripheral, connecting: true });

        await BleManager.connect(peripheral.id);
        console.debug(`[connectPeripheral][${peripheral.id}] connected.`);

        addOrUpdatePeripheral(peripheral.id, {
          ...peripheral,
          connecting: false,
          connected: true,
        });

        // before retrieving services, it is often a good idea to let bonding & connection finish properly
        await sleep(900);

        /* Test read current RSSI value, retrieve services first */
        const peripheralData = await BleManager.retrieveServices(peripheral.id);
        console.debug(
          `[connectPeripheral][${peripheral.id}] retrieved peripheral services`,
          peripheralData,
        );

        // console.log('running readRSSI...');
        // console.log('id: ' + peripheral.id);
        // console.log('type: ' + typeof (peripheral.id));
        const rssi = await BleManager.readRSSI(peripheral.id);
        console.debug(
          `[connectPeripheral][${peripheral.id}] retrieved current RSSI value: ${rssi}.`,
        );

        if (peripheralData.characteristics) {
          for (let characteristic of peripheralData.characteristics) {
            if (characteristic.descriptors) {
              for (let descriptor of characteristic.descriptors) {
                try {
                  let data = await BleManager.readDescriptor(
                    peripheral.id,
                    characteristic.service,
                    characteristic.characteristic,
                    descriptor.uuid,
                  );
                  console.debug(
                    `[connectPeripheral][${peripheral.id}] descriptor read as:`,
                    data,
                  );
                } catch (error) {
                  console.error(
                    `[connectPeripheral][${peripheral.id}] failed to retrieve descriptor ${descriptor} for characteristic ${characteristic}:`,
                    error,
                  );
                }
              }
            }
          }
        }

        console.log('getting peripherals...');
        console.log(peripherals);
        let p = peripherals.get(peripheral.id);
        if (p) {
          addOrUpdatePeripheral(peripheral.id, { ...peripheral, rssi });
        }
      }
      setConnected(true);
    } catch (error) {
      console.error(
        `[connectPeripheral][${peripheral.id}] connectPeripheral error`,
        error,
      );
    }
  };

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    try {
      BleManager.start({ showAlert: false })
        .then(() => console.debug('BleManager started.'))
        .catch(error =>
          console.error('BeManager could not be started.', error),
        );
    } catch (error) {
      console.error('unexpected error starting BleManager.', error);
      return;
    }

    const listeners = [
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      ),
      bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan),
      bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral,
      ),
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleUpdateValueForCharacteristic,
      ),
    ];

    handleAndroidPermissions();

    return () => {
      setBooted(true);
      console.debug('[app] main component unmounting. Removing listeners...');
      for (const listener of listeners) {
        listener.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startScan();
  }, [booted])

  useEffect(() => {
    if (connected) {
      console.log('we\'re connected!');
      console.log(peripherals);
    }
    // const changeModuleName = async (id: string, newName: string): Promise<void> => {
    //   try {
    //     // Connect to the peripheral
    //     await BleManager.connect(id);

    //     // Convert the new name to an array of numbers
    //     const data = Array.from(Buffer.from(newName, 'utf8'));

    //     // Write the new name to the characteristic
    //     await BleManager.write(
    //       id,
    //       '0000ffe0-0000-1000-8000-00805f9b34fb', // Service UUID
    //       '0000ffe2-0000-1000-8000-00805f9b34fb', // Characteristic UUID
    //       data
    //     );

    //     // Disconnect from the peripheral
    //     await BleManager.disconnect(id);

    //     setConnected(false);

    //     console.log('Module name changed successfully!');
    //   } catch (error) {
    //     console.log('Error changing module name:', error);
    //   }
    // };
  }, [connected])

  const handleAndroidPermissions = () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then(result => {
        if (result) {
          console.debug(
            '[handleAndroidPermissions] User accepts runtime permissions android 12+',
          );
        } else {
          console.error(
            '[handleAndroidPermissions] User refuses runtime permissions android 12+',
          );
        }
      });
    } else if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(checkResult => {
        if (checkResult) {
          console.debug(
            '[handleAndroidPermissions] runtime permission Android <12 already OK',
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(requestResult => {
            if (requestResult) {
              console.debug(
                '[handleAndroidPermissions] User accepts runtime permission android <12',
              );
            } else {
              console.error(
                '[handleAndroidPermissions] User refuses runtime permission android <12',
              );
            }
          });
        }
      });
    }
  };

  const renderItem = ({ item }: { item: Peripheral }) => {
    console.log("item connected? - " + item.connected);
    const backgroundColor = item.connected ? '#069400' : Colors.white;
    return (
      <TouchableHighlight
        underlayColor="#0082FC"
        onPress={() => togglePeripheralConnection(item)}>
        <View style={[bleStyles.row, { backgroundColor }]}>
          <Text style={bleStyles.peripheralName}>
            {/* completeLocalName (item.name) & shortAdvertisingName (advertising.localName) may not always be the same */}
            {item.name}
            {item.connecting && ' - Connecting...'}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  const rollDice = () => {
    console.log(customValues);
  }

  const handleSliderChange = (index: number, value: number[], reset: boolean = false) => {
    console.log('changing slider value...');
    const newCustomValues = [...customValues];
    newCustomValues[index] = reset ? 0 : value[0];
    setCustomValues(newCustomValues);
  };

  const refreshSliders = () => {
    setCustomValues([0, 0, 0, 0, 0, 0, 0]);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* {Array.from(peripherals.values()).length > 0 && ( */}
      <View>
        <SliderContainer caption="D4">
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            trackClickable={true}
            onSlidingComplete={(newVal) => handleSliderChange(0, newVal)}
          />
        </SliderContainer>
        <SliderContainer caption="D6">
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            trackClickable={true}
            onSlidingComplete={(value) => handleSliderChange(1, value)}
          />
        </SliderContainer>
        <SliderContainer caption="D8">
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            trackClickable={true}
            onSlidingComplete={(value) => handleSliderChange(2, value)}
          />
        </SliderContainer>
        <SliderContainer caption="D10">
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            trackClickable={true}
            onSlidingComplete={(value) => handleSliderChange(3, value)}
          />
        </SliderContainer>
        <SliderContainer caption="D12">
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            trackClickable={true}
            onSlidingComplete={(value) => handleSliderChange(4, value)}
          />
        </SliderContainer>
        <SliderContainer caption="D20">
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            trackClickable={true}
            onSlidingComplete={(value) => handleSliderChange(5, value)}
          />
        </SliderContainer>
        <SliderContainer caption="D100">
          <Slider
            minimumValue={0}
            maximumValue={20}
            step={1}
            trackClickable={true}
            onSlidingComplete={(value) => handleSliderChange(6, value)}
          />
        </SliderContainer>
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={() => refreshSliders()}>
            <Image
              source={require('./assets/refresh.png')}
              style={{ width: 37, height: 37, marginTop: 25 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
          <TouchableOpacity style={{ backgroundColor: '#2a9df4', borderRadius: 10, padding: 10, marginTop: 24 }} onPress={() => rollDice()}>
            <Text style={{ color: 'white', fontWeight: "bold" }}>Roll Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#2a9df4', borderRadius: 10, padding: 10, marginTop: 24 }} onPress={() => rollDice()}>
            <Text style={{ color: 'white', fontWeight: "bold" }}>Roll D20</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#2a9df4', borderRadius: 10, padding: 10, marginTop: 24 }} onPress={() => rollDice()}>
            <Text style={{ color: 'white', fontWeight: "bold" }}>Roll D100</Text>
          </TouchableOpacity>
        </View>
        <StatusBar />
      </View>
      {/* )} */}

      {/* <View>
        <Text style={{ textAlign: "center", fontSize: 36, fontWeight: "300" }}>Select Tower</Text>
      </View>

      <FlatList
        data={Array.from(peripherals.values())}
        contentContainerStyle={{ rowGap: 12, marginTop: 12, marginBottom: 8, marginLeft: "25%", width: "50%" }}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <SafeAreaView style={bleStyles.body}>
      <Pressable style={bleStyles.scanButton} onPress={startScan}>
        <Text style={bleStyles.scanButtonText}>
          {isScanning ? 'Refreshing...' : 'Refresh'}
        </Text>
      </Pressable> */}

      {/* <Pressable style={bleStyles.scanButton} onPress={retrieveConnected}>
        <Text style={bleStyles.scanButtonText}>
          {'Retrieve connected peripherals'}
        </Text>
      </Pressable>

      {Array.from(peripherals.values()).length === 0 && (
        <View style={bleStyles.row}>
          <Text style={bleStyles.noPeripherals}>
            No Peripherals, press "Scan Bluetooth" above.
          </Text>
        </View>
      )} */}
      {/* </SafeAreaView> */}

    </ SafeAreaView >
  )
};

export default App;
