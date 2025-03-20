export type StatusColor = "green" | "yellow" | "orange" | "red";

export type StatusColorConfig = {
  [K in StatusColor]: {
    color: string;
    percentage: string;
  };
}; 