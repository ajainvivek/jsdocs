<template>
  <div class="frame-block-wrapper" ref="wrapper">
    <div class="pu-view" id="pu-viewport" v-bind:class="{ fullscreen: isFullscreen }" ref="frame">
      <div class="header" v-bind:class="{ fullscreen: isFullscreen }">
        <div class="pu-radio-btn-group">
          <RadioGroup type="button" v-model="selectedView">
            <Radio label="default" data-view="front" id="pu-front-view-btn">Front View</Radio>
            <Radio label="side" data-view="side" id="pu-side-view-btn">Side View</Radio>
            <Radio label="laying" data-view="laying" id="pu-laying-view-btn">Laying View</Radio>
          </RadioGroup>
        </div>
        <div class="pu-btn-group float-right">
          <ButtonGroup size="large" vertical>
            <Button class="pu-btn" dat id="pu-phone-btn">
              <Icon type="md-phone-portrait" size="24"/>
            </Button>
            <Button class="pu-btn" id="pu-tablet-btn">
              <Icon type="md-tablet-landscape" size="24"/>
            </Button>
            <Button class="pu-btn" id="pu-desktop-btn">
              <Icon type="md-laptop" size="24"/>
            </Button>
            <Button class="pu-btn" id="pu-close-fullscreen">
              <Icon type="md-contract" size="24"/>
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div class="body view_3" id="frame-container">
        <iframe
          class="sandbox"
          scrolling="no"
          sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-popups allow-presentation"
          frameborder="0"
          :src="sandboxUrl"
          id="sandbox"
          ref="sandbox"
          title
          style="pointer-events: initial;"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    props: {},
    directives: {},
})
export default class Frame extends Vue {
    private isFullscreen: boolean = false;
    private selectedView: string = 'default';

    get sandboxUrl() {
        const url: any = process.env.VUE_APP_SANDBOX_URL;
        return url;
    }
    public openFullscreen() {
        const frameWrapper: any = this.$refs.frame;
        const closeBtn: any = document.getElementById('pu-close-fullscreen');
        const phoneBtn: any = document.getElementById('pu-phone-btn');
        const tabletBtn: any = document.getElementById('pu-tablet-btn');
        const desktopBtn: any = document.getElementById('pu-desktop-btn');
        const frontViewBtn: any = document.getElementById('pu-front-view-btn');
        const sideViewBtn: any = document.getElementById('pu-side-view-btn');
        const layingViewBtn: any = document.getElementById('pu-laying-view-btn');

        document.getElementsByTagName('body')[0].appendChild(frameWrapper);
        this.isFullscreen = true;

        closeBtn.addEventListener('click', this.closeFullscreen);
        phoneBtn.addEventListener('click', this.switchToPhone);
        tabletBtn.addEventListener('click', this.switchToTablet);
        desktopBtn.addEventListener('click', this.switchToDesktop);
        frontViewBtn.addEventListener('click', this.switchToFrontView);
        sideViewBtn.addEventListener('click', this.switchToSideView);
        layingViewBtn.addEventListener('click', this.switchToLayingView);
    }

    private switchToPhone() {
        const frameContainer: any = document.getElementById('frame-container');
        const radioBtnGroup: any = document.querySelector('.pu-radio-btn-group');
        frameContainer.classList.remove('tablet-size', 'phone');
        frameContainer.classList.add('phone', 'phone-size');
        radioBtnGroup.style.display = 'block';
    }

    private switchToTablet() {
        const frameContainer: any = document.getElementById('frame-container');
        const radioBtnGroup: any = document.querySelector('.pu-radio-btn-group');
        frameContainer.classList.remove('phone-size', 'phone');
        frameContainer.classList.add('phone', 'tablet-size');
        radioBtnGroup.style.display = 'block';
    }

    private switchToDesktop() {
        const frameContainer: any = document.getElementById('frame-container');
        const radioBtnGroup: any = document.querySelector('.pu-radio-btn-group');
        frameContainer.classList.remove('phone-size', 'tablet-size', 'phone');
        frameContainer.classList.add('desktop');
        radioBtnGroup.style.display = 'none';
    }

    private switchToFrontView() {
        const frameContainer: any = document.getElementById('frame-container');
        const viewPortContainer: any = document.getElementById('pu-viewport');
        viewPortContainer.classList.remove('perspective');
        frameContainer.classList.remove('view_1', 'view_2');
        frameContainer.classList.add('view_3');
    }

    private switchToSideView() {
        const frameContainer: any = document.getElementById('frame-container');
        const viewPortContainer: any = document.getElementById('pu-viewport');
        viewPortContainer.classList.add('perspective');
        frameContainer.classList.remove('view_1', 'view_3');
        frameContainer.classList.add('view_2');
    }

    private switchToLayingView() {
        const frameContainer: any = document.getElementById('frame-container');
        const viewPortContainer: any = document.getElementById('pu-viewport');
        viewPortContainer.classList.add('perspective');
        frameContainer.classList.remove('view_2', 'view_3');
        frameContainer.classList.add('view_1');
    }

    private closeFullscreen() {
        const frameWrapper: any = document.getElementsByClassName('pu-view')[0];
        const wrapper: any = this.$refs.wrapper;
        const closeBtn: any = document.getElementById('pu-close-fullscreen');
        const phoneBtn: any = document.getElementById('pu-phone-btn');
        const tabletBtn: any = document.getElementById('pu-tablet-btn');
        const desktopBtn: any = document.getElementById('pu-desktop-btn');
        const frontViewBtn: any = document.getElementById('pu-front-view-btn');
        const sideViewBtn: any = document.getElementById('pu-side-view-btn');
        const layingViewBtn: any = document.getElementById('pu-laying-view-btn');

        wrapper.appendChild(frameWrapper);
        this.isFullscreen = false;

        closeBtn.removeEventListener('click', this.closeFullscreen);
        phoneBtn.removeEventListener('click', this.switchToPhone);
        tabletBtn.removeEventListener('click', this.switchToTablet);
        desktopBtn.removeEventListener('click', this.switchToDesktop);
        frontViewBtn.removeEventListener('click', this.switchToFrontView);
        sideViewBtn.removeEventListener('click', this.switchToSideView);
        layingViewBtn.removeEventListener('click', this.switchToLayingView);
    }
}
</script>

<style lang="scss">
.pu-view {
    &.perspective {
        perspective: 1000px;
    }
    &.fullscreen {
        position: absolute;
        top: 0;
        left: 0;
        background: #ffffff;
        height: 100%;
        width: 100%;
        z-index: 999;

        .pu-btn-group {
            position: absolute;
            right: 20px;
            top: 80px;
            z-index: 9999;

            .pu-btn {
                padding: 16px;
            }
        }

        .pu-radio-btn-group {
            position: absolute;
            left: 50%;
            transform: translate(-50%, 0%);
            display: none;
        }

        .body,
        .sandbox {
            height: 100%;
            width: 100%;
        }

        .phone-size {
            width: 375px;
            height: 667px;
        }

        .tablet-size {
            width: 1024px;
            height: 768px;
        }

        /*Basic Phone styling*/

        .phone {
            border: 40px solid #ddd;
            border-width: 55px 7px;
            border-radius: 40px;
            margin: 50px auto;
            overflow: hidden;
            transition: all 0.5s ease;
        }

        .phone iframe {
            border: 0;
            width: 100%;
            height: 100%;
        }
        /*Different Perspectives*/

        .phone.view_1 {
            transform: rotateX(50deg) rotateY(0deg) rotateZ(-50deg);
            box-shadow: -3px 3px 0 #bbb, -6px 6px 0 #bbb, -9px 9px 0 #bbb, -12px 12px 0 #bbb, -14px 10px 20px #666;
        }

        .phone.view_2 {
            transform: rotateX(0deg) rotateY(-60deg) rotateZ(0deg);
            box-shadow: 5px 1px 0 #bbb, 9px 2px 0 #bbb, 12px 3px 0 #bbb, 15px 4px 0 #bbb, 0 7px 20px #999;
        }

        .phone.view_3 {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
            box-shadow: 0px 3px 0 #bbb, 0px 4px 0 #bbb, 0px 5px 0 #bbb, 0px 7px 0 #bbb, 0px 10px 20px #666;
        }

        @media (max-width: 900px) {
            .frame-block-wrapper {
                transform: scale(0.8, 0.8);
            }
        }

        @media (max-width: 700px) {
            .frame-block-wrapper {
                transform: scale(0.6, 0.6);
            }
        }

        @media (max-width: 500px) {
            .frame-block-wrapper {
                transform: scale(0.4, 0.4);
            }
        }
    }
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.frame-block-wrapper {
    padding: 0px;
    height: 100%;
    width: 100%;

    iframe {
        overflow: hidden;
    }

    .pu-view {
        height: 100%;
        width: 100%;
    }

    .body {
        height: 100%;
        width: 100%;
    }

    .sandbox {
        width: 100%;
        height: 100%;
        min-height: 0px;
        border-width: 0px;
        overflow: auto;
    }

    .header {
        display: none;
    }

    .float-right {
        float: right;
        display: block;
    }
}
</style>