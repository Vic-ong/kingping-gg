import dayjs from 'dayjs';
import { differenceInHours } from 'date-fns';

interface TimeStampProps {
  nanoseconds: number;
  seconds: number;
}

export const formatTimestamp = (dt: TimeStampProps, f = 'MM/DD HH:mm') => {
  return dayjs(new Date(dt.seconds * 1000)).format(f);
};

export const hoursDifference = (dt1: TimeStampProps, dt2: TimeStampProps) => {
  const date1 = new Date(dt1.seconds * 1000);
  const date2 = new Date(dt2.seconds * 1000);
  return Math.abs(differenceInHours(date1, date2));
};

export default {
  formatTimestamp,
};
