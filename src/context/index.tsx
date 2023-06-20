import React from 'react';

export const PermissionBoardContext = React.createContext<any>({
    disableWithVisibilityRestrictedPublic: () => { },
    disableWithExpirationData: () => { },
    disableWithLock: () => { },
});