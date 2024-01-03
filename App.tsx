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
  ActivityIndicator,
} from 'react-native';

import { bleStyles, styles, textFont, rollButtons } from './styles';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Die from './components/die';
import PmButton from './components/pmButton';
import SplashScreen from 'react-native-splash-screen';

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

import { convertString } from 'convert-string'
import { Buffer } from 'buffer';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

declare module 'react-native-ble-manager' {
  // enrich local contract with custom state properties needed by App.tsx
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral['id'], Peripheral>(),
  );
  const [connected, setConnected] = useState(false);
  const [booted, setBooted] = useState(false);
  const [selectedTower, setSelectedTower] = useState<Peripheral | null>(null);
  const [customValues, setCustomValues] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (Platform.OS === "android") {
      SplashScreen.hide();
    }
  }, []);

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
      console.log(peripherals);

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
    const p_name = peripheral?.advertising?.localName;
    if (p_name && p_name == "Tower1") {
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
    const backgroundColor = item.connected ? Colors.white : Colors.white;
    //function to toggle peripheral connection togglePeripheralConnection(item)
    return (
      <TouchableHighlight
        underlayColor={Colors.white}
        onPress={() => setSelectedTower(item)}>
        <View style={[bleStyles.row, { backgroundColor }]}>
          <Text style={bleStyles.peripheralName}>
            {/* completeLocalName (item.name) & shortAdvertisingName (advertising.localName) may not always be the same */}
            {item.advertising.localName}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  const changeValue = (action: string, roller: number) => {
    setCustomValues((prevCustomValues) => {
      const updatedValues = [...prevCustomValues];
      if (action === 'plus') {
        updatedValues[roller] = (updatedValues[roller] || 0) + 1;
      } else if (action === 'minus') {
        updatedValues[roller] = (updatedValues[roller] || 0) - 1;
      }
      return updatedValues;
    });
  };

  const refreshValues = () => {
    setCustomValues([0, 0, 0, 0, 0, 0, 0]);
  }

  const assets = [
    { "roller": 0, "die": '4' },
    { "roller": 1, "die": '6' },
    { "roller": 2, "die": '8' },
    { "roller": 3, "die": '10' },
    { "roller": 4, "die": '12' },
    { "roller": 5, "die": '20' },
    { "roller": 6, "die": '100' },
  ]

  const rollDice = async (deviceUUID: string, intArray: number[]) => {

    refreshValues();

    console.log(selectedTower?.advertising.serviceData);
    try {

      const BleManagerModule = NativeModules.BleManager;
      const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

      await BleManager.connect(deviceUUID);

      // Retrieve services and characteristics of a connected device
      const retrieveServicesAndCharacteristics = async (dUUID: string) => {
        try {
          const services = await BleManager.retrieveServices(dUUID);
          console.log('Services:', services);
        } catch (error) {
          console.error('Error retrieving services and characteristics:', error);
        }
      };

      // Usage
      await retrieveServicesAndCharacteristics(deviceUUID);

      const buffer = Buffer.from(JSON.stringify(intArray));
      console.log(buffer);

      // Subscribe to notifications from the BLE device
      await BleManager.startNotification(deviceUUID, 'ffe0', 'ffe1');

      bleManagerEmitter.addListener(
        "BleManagerDidUpdateValueForCharacteristic",
        ({ value, peripheral, characteristic, service }) => {
          // Convert bytes array to string
          const data = String.fromCharCode(...value);
          console.log(`Received ${data} for characteristic ${characteristic}`);

          const closeConnection = async (dUUID: string) => {
            await BleManager.disconnect(dUUID);
            console.log('Data sent successfully and device disconnected!');
          }

          closeConnection(deviceUUID);
        }
      );

      // Write the data to the BLE device
      await BleManager.writeWithoutResponse(
        deviceUUID,
        'ffe0',
        'ffe1',
        buffer.toJSON().data
      );


    } catch (error) {
      console.log('Error:', error);
      await BleManager.disconnect(deviceUUID);
      console.log('device disconnected');
    }
  };

  if (selectedTower != null) {
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: "space-between", marginBottom: 10 }}>
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => setSelectedTower(null)}>
              <Image
                source={require('./assets/back.png')}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 36, paddingTop: 5, fontFamily: 'Roboto-LightItalic' }}>{selectedTower.advertising.localName}</Text>
            <TouchableOpacity style={{}} onPress={() => refreshValues()}>
              <Image
                source={require('./assets/refresh.png')}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          </View>
          {assets.map((asset) => (
            <View key={asset.roller} id={asset.die} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Die asset={asset.die} />
              <TouchableOpacity onPress={() => changeValue('minus', asset.roller)}>
                <PmButton buttonType='minus' />
              </TouchableOpacity>
              <Text style={textFont.font}>{customValues[asset.roller]}</Text>
              <TouchableOpacity onPress={() => changeValue('plus', asset.roller)}>
                <PmButton buttonType='plus' />
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={rollButtons.button} onPress={() => rollDice(selectedTower.id, customValues)}>
              <Text style={rollButtons.text}>Roll Custom</Text>
            </TouchableOpacity>
            <TouchableOpacity style={rollButtons.button} onPress={() => rollDice(selectedTower.id, [0, 0, 0, 0, 0, 1, 0])}>
              <Text style={rollButtons.text}>Roll D20</Text>
            </TouchableOpacity>
            <TouchableOpacity style={rollButtons.button} onPress={() => rollDice(selectedTower.id, [0, 0, 0, 0, 0, 0, 1])}>
              <Text style={rollButtons.text}>Roll D100</Text>
            </TouchableOpacity>
          </View>
          <StatusBar />
        </View>
      </ SafeAreaView >
    )
  }

  return (
    <SafeAreaView>
      <View style={{ marginTop: "50%" }}>
        <Text style={{ textAlign: "center", fontSize: 36, fontWeight: "300" }}>Select Tower</Text>
      </View>

      {isScanning
        ? (<View style={{ paddingTop: 24 }}><ActivityIndicator size="large" /></View>)
        : (
          <View>
            <FlatList
              data={Array.from(peripherals.values())}
              contentContainerStyle={{ rowGap: 12, marginTop: 24, marginBottom: 8, marginLeft: "25%", width: "50%" }}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
            <View>
              <Pressable style={bleStyles.scanButton} onPress={startScan}>
                <Text style={bleStyles.scanButtonText}>
                  {isScanning ? 'Refreshing...' : 'Refresh'}
                </Text>
              </Pressable>

              <View>
                {Array.from(peripherals.values()).length === 0 && (
                  <View style={bleStyles.row}>
                    <Text style={bleStyles.noPeripherals}>
                      No Towers found. Press "Refresh" above.
                    </Text>
                  </View>
                )}
              </View>

            </View>
          </View>
        )}

    </ SafeAreaView >
  )
};

export default App;
