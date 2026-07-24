import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from './styles';

const KEY_ROWS = [
  [{ main: '1' }, { main: '2', sub: 'abc' }, { main: '3', sub: 'def' }],
  [{ main: '4', sub: 'ghi' }, { main: '5', sub: 'jkl' }, { main: '6', sub: 'mno' }],
  [{ main: '7', sub: 'pqrs' }, { main: '8', sub: 'tuv' }, { main: '9', sub: 'wxyz' }],
  [{ blank: true }, { main: '0' }, { backspace: true }],
];

const NumericKeypad = ({ onKeyPress }) => {
  return (
    <View style={styles.container}>
      {KEY_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => {
            if (key.blank) {
              return <View key={keyIndex} style={[styles.key, styles.blankKey]} />;
            }
            if (key.backspace) {
              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={styles.key}
                  onPress={() => onKeyPress('backspace')}
                >
                  <Icon name="backspace-outline" size={22} color="#2A2A2A" />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                key={keyIndex}
                style={styles.key}
                onPress={() => onKeyPress(key.main)}
              >
                <Text style={styles.keyText}>{key.main}</Text>
                {key.sub ? <Text style={styles.keySubText}>{key.sub}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default NumericKeypad;
