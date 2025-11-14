import 'react-native';
import React from 'react';
import {getFormattedFileDate, extractCycleTypeLetter, extractWorkingState,
  extractDateFromFile, extractTimeFromFile, convertDateToFullFormat,
  convertTimeToFullFormat, extractFormattedDateFromFileName, sortFileNamesInAntiChronologicalOrder, extractCycleTime, extractDateTimeFormat} from '../src/components/Common_functions'

const fileDate = '221106';
const expectedFileDate = '2022 11 06';
const fileTime = '0706';
const expectedFileTime = '07 06';
const fileName = '200000-221106-0706-F';
const expectedFullFileDate = '2022 11 06 07 06';
const foldersList = [
  '200000-221106-0706-F',
  '200000-221106-0706-R',
  '200000-221106-1006-R',
  '200000-221206-1006-R',
  '200000-221205-1006-R',
  '200000-211205-1006-F',
  '200000-211205-1007-F',
];

const expectedFoldersList = [
  '200000-221206-1006-R',
  '200000-221205-1006-R',
  '200000-221106-1006-R',
  '200000-221106-0706-F',
  '200000-221106-0706-R',
  '200000-211205-1007-F',
  '200000-211205-1006-F',
];
const timestamp = "1668438424";
const expectedTimeFormat = "15:07"

const dateTimeFirstTimestamp = "1669330719";
const expectedFirstDateTimeFormat = "24/11/2022 22:58"

const dateTimeSecondTimestamp = "1669330839";
const expectedSecondDateTimeFormat = "24/11/2022 23:00"

it('test extraction of date in YYMMDD format from the full path of the track folder', () => {
  expect(getFormattedFileDate('/storage/emulated/0/DCIM/ColdTrace/ROLL_STRIP_191056/06-11-2022')).toBe(fileDate);
});

it('test extraction of cycle type letter representation', () => {
  expect(extractCycleTypeLetter('02')).toBe('F');
});

it('test extraction of working state from hex value', () => {
  expect(extractWorkingState('01','01','1.29')).toBe('Transitoire Production de Chaud PWM');
});

it('test extraction of date from file name', () => {
  expect(extractDateFromFile(fileName)).toBe(fileDate);
});

it('test extraction of time from file name', () => {
  expect(extractTimeFromFile(fileName)).toBe(fileTime);
});

it('test conversion of date format from YYMMDD to YYYY MM DD', () => {
  expect(convertDateToFullFormat(fileDate)).toBe(expectedFileDate);
});

it('test conversion of time format from HHmm  to HH mm', () => {
  expect(convertTimeToFullFormat(fileTime)).toBe(expectedFileTime);
});

it('test extraction of formatted date in YYYY MM DD HH mm format from file name ', () => {
  expect(extractFormattedDateFromFileName(fileName)).toBe(expectedFullFileDate);
});

it('test extraction of formatted date in YYYY MM DD HH mm format from file name ', () => {
  expect(sortFileNamesInAntiChronologicalOrder(foldersList)).toStrictEqual(expectedFoldersList);
});

it('test extraction of time in HH:mm format from timestamp ', () => {
  expect(extractCycleTime(timestamp)).toBe(expectedTimeFormat);
});

it('test extraction of date in DD/MM/YYYY HH:mm format from timestamp ', () => {
  expect(extractDateTimeFormat(dateTimeFirstTimestamp)).toBe(expectedFirstDateTimeFormat);
});

it('test extraction of date in DD/MM/YYYY HH:mm format from timestamp ', () => {
  expect(extractDateTimeFormat(dateTimeSecondTimestamp)).toBe(expectedSecondDateTimeFormat);
});

