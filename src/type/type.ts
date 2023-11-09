export interface Equipment {
  value: string;
  label: string;
  workingLoad: number;
  loadLimit: number;
  quantity: number;
  inletThrust: number;
  outletThrust: number;
  category: string;
}

export interface DataNode extends Equipment {
  parentNode?: string;
}

// export interface SumOfEachCategory {
//   thrust: number;
//   outletThrust: number;
//   cablesWorkingLoad: number;
//   cablesLoadLimit: number;
//   bracketWorkingLoad: number;
//   bracketLoadLimit: number;
//   ginyaWorkingLoad: number;
//   ginyaLoadLimit: number;
// }