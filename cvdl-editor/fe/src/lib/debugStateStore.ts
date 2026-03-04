export type DebugStateSnapshot = {
	capturedAt: string;
	payload: unknown;
};

let latestDebugStateSnapshot: DebugStateSnapshot | null = null;

export const setDebugStateSnapshot = (payload: unknown) => {
	latestDebugStateSnapshot = {
		capturedAt: new Date().toISOString(),
		payload,
	};
	return latestDebugStateSnapshot;
};

export const getDebugStateSnapshot = () => latestDebugStateSnapshot;
