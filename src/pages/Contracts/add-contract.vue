<template>
  <q-page class="flex flex-center cursor-pointer non-selectable">
    <q-form
      ref="myForm"
      class="card-page"
    >
      <header-actions
        :titlePage="getTitle()"
        :btn-action="btnAction"
        :btn-close-window="btnCloseWindow"
      />

      <div class="main-container-page main-container-page-dark container-form">
        <div
          class="w-100 absolute-full flex flex-center"
          v-if="loading"
        >
          <div class="q-ma-md q-ma-sm-xl q-pa-xl text-center no-info border-rounded">
            <q-spinner-pie
              color="primary"
              class="q-mt-lg"
              size="4em"
            />
            <div class="text-primary q-ma-lg">Cargando ...</div>
          </div>
        </div>

        <q-scroll-area
          v-else
          class="q-pa-md q-pa-lg-lg h-97"
          :thumb-style="$store.getters['global/getThumbStyle']"
        >
          <div
            class="form__item-label text-weight-medium q-mb-lg q-pa-md border-rounded"
            style="background-color: #008cff2b;"
          >
            1-. Elige un nombre para el contrato y los equipos que desees incluir
          </div>

          <div class="col q-pr-md form__item-label text-weight-medium">
            Nombre del contrato*
          </div>

          <q-input
            v-model="form.contractName"
            borderless
            dense
            hide-hint
            hide-bottom-space
            :rules="[
              rules.requiredString,
              rules.maxLength(50)
            ]"
            class="form__input bg-accent q-mb-lg"
          />

          <div
            class="row"
            style="gap: 20px"
          >
            <div
              class="col-12 col-sm-5 col-md-4 border-line q-pa-sm border-rounded bg-accent"
              style="max-height: 450px;"
            >
              <q-input
                ref="filterRef"
                v-model="filter"
                borderless
                dense
                class="form__input q-input-equipments"
                label="Filtrar por categoría"
              >
                <template v-slot:append>
                  <q-icon
                    v-if="filter !== ''"
                    name="clear"
                    class="cursor-pointer"
                    @click="resetFilter"
                  />
                </template>
              </q-input>

              <q-tree
                style="max-height: 390px; overflow: scroll;"
                v-model:ticked="form.equipmentIds"
                class="font-tree q-pa-xs"
                no-transition
                :nodes="localCategories"
                tick-strategy="leaf"
                node-key="id"
                no-nodes-label="No hay equipos para mostrar"
                label-key="label"
                :filter="filter"
                :filter-method="filterEquipments"
                @lazy-load="getEquipmentsByCategory"
              />
            </div>

            <div class="col-12 col-sm container-table-plans">
              <general-table
                class="w-100"
                style="height: auto; max-height: 450px;"
                :rows="rows"
                :columns="columns"
                :pagination-prop="paginationProp"
                :show-pagination="false"
              />
            </div>
          </div>

          <div
            class="form__item-label text-weight-medium q-my-lg q-pa-md border-rounded"
            style="background-color: #008cff2b;"
          >
            2-. Selecciona el tipo de contrato
          </div>

          <div
            class="row"
            style="gap: 20px"
          >
            <div class="col-sm-auto col-12">
              <div
                class="row q-mb-md"
                style="max-width: 418px"
              >
                <div
                  style="font-size: 12px;"
                  class="text-primary q-pb-sm"
                >
                  <span style="font-size: 16px; font-weight: 500;">¿El tipo de contrato es <strong>comodato</strong>
                    ?</span>
                </div>

                <div class="col-12">
                  <q-checkbox
                    size="sm"
                    v-model="form.comodato"
                    label="Comodato"
                    class="form__checkbox q-mr-md q-pa-sm border-rounded"
                    dense
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="!form.comodato"
            class="row"
            style="gap: 20px"
          >
            <div class="col-12 col-sm-3">
              <div class="form__item-label text-weight-medium">
                Fecha inicial del contrato
              </div>
              <date-component
                class="form__input bg-accent"
                v-model:model="startDate.model"
                :item="startDate"
              />
            </div>

            <div class="col-12 col-sm-3">
              <div class="form__item-label text-weight-medium">
                Fecha final del contrato
              </div>
              <date-component
                class="form__input bg-accent"
                v-model:model="endDate.model"
                :item="endDate"
              />
            </div>
          </div>

          <div>
            <div
              class="form__item-label text-weight-medium q-my-lg q-pa-md border-rounded"
              style="background-color: #008cff2b;"
            >
              3-. Agrega algunas observaciones
            </div>

            <div class="w-100">
              <q-editor
                v-model="form.observations"
                :placeholder="'Escribe aquí las notas del contrato'"
                class="form__textarea bg-accent border-rounded"
                :toolbar="[
                  [
                    {
                      label: $q.lang.editor.fontSize,
                      icon: $q.iconSet.editor.fontSize,
                      fixedLabel: true,
                      fixedIcon: true,
                      list: 'no-icons',
                      options: [
                        'size-1',
                        'size-2',
                        'size-3',
                        'size-4',
                      ],
                    },
                    'bold',
                    'italic',
                    'strike',
                    'underline',
                  ],
                  ['unordered', 'ordered'],
                ]"
              />
            </div>
          </div>

          <div class="q-pa-md q-my-md border-line border-rounded">
            <div class="form__item-label text-weight-medium w-100 bg-accent q-pa-sm bg-accent border-rounded">
              Elige un documento desde tus archivos (opcional)
            </div>

            <input-file-component
              :upload-file="uploadFile"
              :removeFile="removeFile"
              :show-text="false"
              icon="png/add-file.png"
              accept="application/pdf"
              type="file"
              v-model:default-image="defaultFile"
            />

          </div>
        </q-scroll-area>
      </div>
    </q-form>
  </q-page>
</template>

<script>

import { ref, defineComponent } from 'vue';
import HeaderActions from 'src/components/compose/HeaderActions.vue';
import GeneralTable from 'src/components/compose/GeneralTable.vue';
import { rules, showWarning, showSuccess } from 'app/utils/utils';
import DateComponent from 'src/components/atomic/Form/DateComponent.vue';
import InputFileComponent from 'src/components/atomic/Form/InputFileComponent.vue';

export default defineComponent({
  name: 'AddContract',
  components: {
    HeaderActions,
    GeneralTable,
    DateComponent,
    InputFileComponent
  },

  data() {
    return {
      delaySearch: 300,
      timeoutSearch: null,
      loading: false,
      defaultFile: null,

      paginationProp: {
        rowsPerPage: null
      },

      btnAction: {
        show: true,
        btnTitle: 'Guardar',
        iconName: 'o_save',
        btnWidth: 'auto',
        loader: false,
        tooltip: 'Agregar contrato',
        btnAction: this.createOrEdit,
      },

      btnCloseWindow: {
        iconName: 'exit_to_app',
        btnBackground: '#FF990020',
        btnColor: '#FF9900',
        btnAction: this.goBack
      },

      form: {
        ContractId: null,
        contractName: '',
        observations: '',
        createdAt: this.getCreatedAt(),
        equipmentIds: [],
        comodato: false,
        file: null
      },

      filter: ref(''),
      filterRef: ref(null),

      columns: [
        {
          name: 'categoryName',
          required: true,
          label: 'Equipo',
          align: 'left',
          field: 'categoryName',
          style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px',
          sortable: true,
        },
        {
          name: 'equipmentModel',
          label: 'Modelo',
          field: 'equipmentModel',
          align: 'left',
          style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px',
          sortable: true,
        },
        {
          name: 'location',
          label: 'Ubicación',
          field: 'location',
          align: 'left',
          style: 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px',
          sortable: true,
        },
        {
          name: 'serialNumber',
          label: 'No. serie',
          field: 'serialNumber',
          align: 'center',
          sortable: true,
        }
      ],

      localCategories: [],

      endDate: {
        model: '',
      },

      startDate: {
        model: '',
      },

      rules,
      originalDocument: null
    };

  },

  watch: {
    form: {
      handler(val) {
        if (!this.defaultFile) {
          if (val.file) {
            this.defaultFile = val.file
          }
        }
      },
      deep: true,
    },
    'form.comodato'() {
      this.startDate.model = ''
      this.endDate.model = ''
    },
    'startDate.model'() {
      this.endDate.model = ''; // Reinicia la fecha final
      this.endDate.rules = [
        () => {
          // Validación para asegurar que la fecha final no sea menor que la fecha inicial
          if (this.startDate.model && this.endDate.model) {
            return this.endDate.model >= this.startDate.model || 'La fecha final no puede ser anterior a la fecha inicial';
          }
          return true;
        }
      ];
    }
  },

  created() {
    this.loading = true
    this.getCategories();
  },

  computed: {
    categories() {
      return this.$store.getters['equipments/getCategoriesGetter'];
    },

    rows() {
      let children = [];
      this.localCategories.forEach(category => {
        if (category.children && category.children.length > 0) {
          const filteredChildren = category.children.filter(child => this.form.equipmentIds.includes(child.id));
          children.push(...filteredChildren);
        }
      });

      return children
    },
  },

  methods: {
    async createContract() {
      this.btnAction.loader = true;

      try {
        this.form.startDate = this.startDate.model
        this.form.endDate = this.endDate.model

        const res = await this.$store.dispatch(
          'contracts/postContractAction',
          this.form
        );

        if (res === true) {
          showSuccess(this.$q, { title: 'Éxito al crear el contrato', msg: 'El contrato se ha agregado' });
          this.$router.go(-1);
        } else {
          showWarning(this.$q, { msg: 'Inténtalo de nuevo más tarde y si el error persiste, repórtalo' });
        }
        this.btnAction.loader = false;
      } catch (error) {
        this.btnAction.loader = false;
      }
    },

    async getContract() {
      try {
        const params = {
          id: this.$route.params.id
        }
        this.form = { ...this.form, ...await this.$store.dispatch('contracts/getContractAction', params) }
        this.startDate.model = await this.form?.startDate
        this.endDate.model = await this.form?.endDate

        this.originalDocument = this.form?.file

      } catch (error) {
        console.log(error)
      }
    },

    async editContract() {
      this.btnAction.loader = true;
      try {
        this.form.id = this.$route.params.id

        this.form.startDate = this.startDate?.model
        this.form.endDate = this.endDate?.model


        if (typeof (this.form.file) === 'string') {
          delete this.form.file
        }

        const res = await this.$store.dispatch(
          'contracts/updateContractAction',
          this.form
        );

        if (res === true) {
          showSuccess(this.$q, { title: 'Éxito al editar el contrato', msg: 'El contrato se ha actualizado' });
          this.$router.go(-1);
        } else {
          showWarning(this.$q, { msg: 'Inténtalo de nuevo más tarde y si el error persiste, repórtalo' });
        }
        this.btnAction.loader = false;
      } catch (error) {
        this.btnAction.loader = false;
      }
    },

    async createOrEdit() {
      this.$refs.myForm.validate().then(success => {
        if (success && this.validatePayload()) {
          if (this.isEditing()) {

            this.editContract()
          } else {
            this.createContract()
          }
        } else {
          return false
        }
      })
    },

    async getCategories() {
      try {
        await this.$store.dispatch('equipments/getCategoriesAction', {
          filterPlanDates: false,
          // categoryId: 
        })
        this.localCategories = JSON.parse(JSON.stringify(this.categories));

        if (this.isEditing()) {
          await this.getContract()
          if (this.form && this.form?.equipments) {

            this.form.equipments.forEach((cat) => {
              let existingCategory = this.localCategories.find((cat2) => cat.id === cat2.id);
              if (existingCategory) {
                existingCategory.children = cat.children;
              } else {
                this.localCategories.unshift(cat);
              }
            });
          }
        }

        this.loading = false

      } catch (error) {
        console.log(error)
        this.loading = false
      }
    },

    async getEquipmentsByCategory({ key, node, done }) {
      try {
        const equipments = [
          ...node.children,
          ...await this.$store.dispatch('equipments/getEquipmentsByCategoryAction', {
            categoryId: key,
            filterPlanDates: false,
          })]


        if (equipments.length > 0)
          done(equipments)
        else done([])
      } catch (error) {
        console.log(error)
      }
    },

    uploadFile(file) {
      try {
        // Realizar otras operaciones si es necesario
        if (file !== undefined) {
          this.form.file = file;
          delete this.form?.removeDocument
        }
      } catch (error) {
        /* Manejar el error si es necesario */
      }
    },

    removeFile() {
      this.form.removeDocument = true
    },

    getTitle() {
      if (this.isEditing()) {
        return 'Editar contrato'
      }
      else return 'Nuevo contrato de servicio'
    },

    getCreatedAt() {
      if (this.isEditing()) {
        return ''
      }
      else return this.$store.getters['global/getDate']
    },

    isEditing() {
      return this.$route.params.id ? true : false
    },

    filterEquipments(node, filter) {
      const filt = filter.toLowerCase();
      // console.log(node)
      if (filt === '') {
        return true; // Muestra todos los nodos cuando no hay filtro
      }

      // Normaliza y quita los diacríticos de la cadena de filtro
      const filtNormalized = filt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // Crea una expresión regular para el filtro insensible a mayúsculas/minúsculas
      const regex = new RegExp(filtNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      // Normaliza y quita los diacríticos de la etiqueta del nodo
      const nodeLabelNormalized = node.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // Compara la etiqueta del nodo con la expresión regular
      return regex.test(nodeLabelNormalized);
    },

    resetFilter() {
      if (this.filter) {
        this.filter = '';
        this.filterRef?.value?.focus();
      }
    },

    goBack() {
      this.$router.go(-1);
    },

    validatePayload() {
      return (this.validateEquipments() && this.validateDates())
    },

    validateEquipments() {
      let equipments = this.form.equipmentIds.length > 0
      if (!equipments) {
        showWarning(this.$q, {
          title: 'Mínimo debe de incluir un equipo',
          msg: 'El contrato al menos debe de incluir un equipo'
        })
      }
      return equipments
    },

    validateDates() {
      if (!this.form.comodato && (!this.startDate.model || !this.endDate.model)) {
        showWarning(this.$q, {
          title: 'Campos requeridos',
          msg: 'Debe ingresar una fecha de inicio y fin del contrato o activar comodato'
        });
        return false; // Devolver false ya que las fechas son requeridas
      }

      return true; // Devolver true si la validación pasa
    }
  },
});
</script>

<style lang="scss" scoped>
.main-container-page {
  background-color: white;
}

.q-tree__node-header-content {
  font-size: 13px;
  color: rgb(121, 123, 123) !important;
}

.q-field__label {
  padding-bottom: 0.5rem !important;
}

.q-input-equipments {
  background-color: #FF990020;
}
</style>
