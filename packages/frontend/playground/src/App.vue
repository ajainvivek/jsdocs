<template>
	<div class="layout">
		<Layout>
			<Header class="pu-layout-header">
				<Menu mode="horizontal" theme="light" active-name="1">
                    <router-link to="/">
                        <div class="layout-logo">
						    <img src="./assets/jsdocs-small-logo.png" height="32" />
					    </div>
                    </router-link>
					<div class="header-subtitle">
						| <span>Studio</span>
					</div>
					<div class="layout-nav">
					</div>
				</Menu>
			</Header>
			<Content class="main-content">
				<router-view></router-view>
			</Content>
		</Layout>
	</div>
</template>

<style lang="scss">
.layout {
    border: 1px solid #d7dde4;
    background: #f5f5f5;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
}
.layout-logo {
    width: 110px;
    height: 32px;
    border-radius: 3px;
    float: left;
    position: relative;
    top: 10px;
    left: 20px;
}
.layout-nav {
    width: 120px;
    margin: 0 auto;
    margin-right: 20px;

    .ivu-menu-item-selected,
    .ivu-menu-item-active {
        color: #515a6e !important;
        border-bottom: none !important;
    }
}

.layout-footer-center {
    text-align: center;
}

.pu-layout-header {
    height: 60px !important;
    line-height: 60px !important;
    padding: 0 !important;

    .header-subtitle {
        position: relative;
        float: left;
        font-size: 16px;

        span {
            padding: 0 6px;
        }
    }
}

.main-content {
    height: calc(100vh - 62px);
}

.component-search-block-wrapper {
    .ivu-card-body {
        padding: 10px;
    }
}
</style>
