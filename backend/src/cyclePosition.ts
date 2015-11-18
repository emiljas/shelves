export default function(position, maxPosition) {
  if(position < 1)
    return maxPosition + position % maxPosition;
  if(position > maxPosition)
    return position % maxPosition;
  return position;
};
