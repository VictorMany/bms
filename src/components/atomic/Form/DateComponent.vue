<template>
    <q-input
        v-model="localModel"
        :name="item.key"
        borderless
        dense
        hide-hint
        hide-bottom-space
        bottom-slots
        readonly
        stack-label
        :label="item?.innerLabel"
        :rules="item.rules"
        @click="item.readonly ? () => { } : $refs.proxy.show()"
    >
        <template v-slot:append>
            <q-btn
                v-if="!item.readonly"
                icon="event"
                size="xs"
                color="primary"
                unelevated
                round
            >
                <q-popup-proxy
                    ref="proxy"
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                >
                    <q-date
                        v-model="localModel"
                        mask="YYYY-MM-DD"
                        :name="item.key"
                        navigation-min-year-month="1900/01"
                        :navigation-max-year-month="item.restrictedMaxDate ? item.restrictedMaxDate : '2100/12'"
                    />
                </q-popup-proxy>
            </q-btn>

            <q-icon
                v-else
                name="lock"
                size="xs"
            />
        </template>
    </q-input>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'DateInputWithPicker',
    props: {
        item: {
            type: Object,
            required: true,
        },
        model: {
            type: [String, null],
            required: true,
        }
    },
    data() {
        return {
            localModel: this.model
        };
    },
    methods: {
        updateParent() {
            this.$emit('update:model', this.localModel);
        }
    },
    watch: {
        localModel(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.updateParent();
            }
        },
        model(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.localModel = newValue;
            }
        }
    }
});
</script>