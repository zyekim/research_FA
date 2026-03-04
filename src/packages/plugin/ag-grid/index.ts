import "./style.scss";
import "ag-grid-community/styles/ag-grid.css";

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

import { AgGridVue } from "ag-grid-vue3";

export default AgGridVue;
