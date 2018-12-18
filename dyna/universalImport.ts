export const importUniversal = <TModule>(moduleName: string): TModule => {
  const universalImports =
    (typeof process !== "undefined" && (process as any).universalImports) ||
    (typeof window !== "undefined" && (window as any).universalImports);

  if (!universalImports) {
    console.error(`importUniversal error: no exports found, use exportUniversalNode/exportUniversalWeb to export universal modules`);
  }

  const runningEnvironment: string =
    process && (process as any).universalImports
      ? "node"
      : "web";

  if (!universalImports[moduleName]) {
    console.error(`importUniversal error: module [${moduleName}] not found, seems that is not exported for running Environment [${runningEnvironment}]`);
  }

  return universalImports[moduleName];
};

export const exportNode = (references: { [refName: string]: any }): void => {
  exportTo("node", references);
};


export const exportWeb = (references: { [refName: string]: any }): void => {
  exportTo("web", references);
};

const exportTo = (target: "web" | "node", references: { [refName: string]: any }): void => {
  const ground = target === "web" ? (window as any) : (process as any);
  ground.universalImports = {
    ...(ground.universalImports || {}),
    ...references,
  };
};
