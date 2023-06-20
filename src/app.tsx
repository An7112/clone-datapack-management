import React from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { LayoutManager, DefaultURLEncoder } from '@gotecq/layout';
import { PageError404, Module, BaseApplication, AppBoundary, AppWrapper } from '@gotecq/core';
import { configStoreAsync, EntityModule, ENTITY_KEY } from '@gotecq/state';
import { createBrowserHistory } from 'history';
import { BASE_URL, loadAsyncConfig } from './config';

import './app.scss';
import { Loading } from '@gotecq/s8-component';
import { DatapackNavBar } from './component';


import { setup as AuthSetup } from '@gotecq/core';
import { setup as DatapackManagerSetup } from './modules/datapack-manager';
import { setup as ScheduleManagerSetup } from './modules/schedule';
import { setup as ActiveHistoryManagerSetup } from './modules/active-history-manager';
import { setup as FileManagement } from './modules/file-management';

const InstalledModule = {
    'auth': { setup: AuthSetup },
    'datapack-manager': { setup: DatapackManagerSetup },
    'schedule-manager': { setup: ScheduleManagerSetup },
    'file-manager': { setup: FileManagement },
    'active-history-manager': { setup: ActiveHistoryManagerSetup },
};

export default class RootApplication extends BaseApplication {
    layoutManager: LayoutManager;
    constructor(props) {
        super(props);
        this.layoutManager = new LayoutManager(new DefaultURLEncoder(), BASE_URL);
    }
    getInstalledModule() {
        return InstalledModule;
    }
    async initiate() {
        // Setup begin
        this.setState({ loading: true });

        // Load config 
        await this.loadConfig(loadAsyncConfig);

        // Setup module
        this.setupModule();

        // Setup router
        this.history = createBrowserHistory({
            basename: BASE_URL,
        });

        // Setup redux state
        this.store = await configStoreAsync(
            this.history,
            this.moduleRegistry.reducers(),
            this.moduleRegistry.sagas(),
        );

        this.setupAnalysisAndMonitor();

        this.layoutManager.setDispatchFunction(this.store.dispatch);

        // Setup end
        this.setState({ loading: false }, () => {
            this.initAppDone();
        });
    }
    setupModuleDone() {
        const entityModule = new Module();
        EntityModule.setup(entityModule, this.moduleRegistry.entities());
        this.moduleRegistry.register(ENTITY_KEY, entityModule);
        this.layoutManager.setComponentGetter((module: string, key: string) => {
            return this.moduleRegistry.getPanel(module, key);
        });
    }
    renderApp() {
        return (
            <AppBoundary>
                <Provider store={this.store}>
                    <ConnectedRouter history={this.history}>
                        <AppWrapper
                            layoutManager={this.layoutManager}
                            navbar={DatapackNavBar}
                            allRoutes={this.moduleRegistry.routes()}
                        >
                            <Switch>
                                <Route
                                    path="/"
                                    exact
                                    render={() => <Redirect
                                        to='/datapack-manager'
                                    />}
                                />
                                {this.renderRoute()}
                                <Route component={PageError404} />
                            </Switch>
                        </AppWrapper>
                    </ConnectedRouter>
                </Provider>
            </AppBoundary>
        );
    }
    initAppDone() { }
    render() {
        const { loading } = this.state;
        if (loading) {
            return <Loading.FullView />;
        }
        return this.renderApp();
    }
}
