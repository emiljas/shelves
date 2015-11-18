export default function(position: number, maxPosition: number): number {
  if(position < 1)
    return maxPosition + position % maxPosition;
  if(position > maxPosition)
    return position % maxPosition;
  return position;
};
