<template>
  <q-page class="flex flex-center cursor-pointer non-selectable">
    <div class="card-page">
      <header-actions
        title-page="Reportes"
        :btnAction="btnAction"
        :inputSearch="inputSearch"
        :btn-close-window="showCloseBtn() ? btnCloseWindow : null"
        v-model:searchModel="searchModel"
        v-model:switch-content="switchContent"
      />

      <div
        class="main-container-page  q-pa-sm"
        :class="{ 'card-color main-container-page-dark': switchContent === 1 }"
      >
        <q-scroll-area
          v-if="switchContent === 1"
          style="height: 93% !important"
          class="fit"
          :thumb-style="$store.getters['global/getThumbStyle']"
        >
          <div style="max-width: 100%">
            <div
              v-if="reports.length > 0"
              class="row container-cards"
            >
              <div
                v-for="(report, index) in cards"
                :key="index"
                class="col-xs-12 col-sm-auto col-md-auto col-lg-auto col-xl-auto"
              >
                <item-card
                  v-bind="report"
                  :index="index"
                  :card-action="goToDetails"
                />
              </div>
            </div>

            <div
              v-else-if="loading"
              class="q-ma-md q-ma-sm-xl q-pa-xl text-center no-info border-rounded"
            >
              <q-spinner-pie
                color="primary"
                class="q-mt-lg"
                size="4em"
              />
              <div class="text-primary q-ma-lg">Cargando reportes</div>
            </div>

            <div
              class="q-ma-md q-ma-sm-xl q-pa-xl text-center no-info border-rounded"
              v-else-if="loading === false"
            >
              No hay reportes para mostrar
              <strong class="text-negative">!</strong>
            </div>
          </div>
        </q-scroll-area>

        <div
          v-if="switchContent === 1 && reports.length > 0"
          style="height: 6.55%"
          class="row justify-center q-pt-sm"
        >
          <q-pagination
            v-model="localPagination.page"
            :disable="loading"
            :max="localPagination.totalPages"
            class="q-mt-none pagination-style"
            dense
            size="md"
            direction-links
            boundary-numbers
            :max-pages="6"
            @update:model-value="changePagination"
          />
        </div>

        <general-table
          v-else-if="switchContent === 2"
          v-model:row-selected="rowSelected"
          :height="'100%'"
          :rows="reports"
          :columns="columns"
          :loading="loading"
          :actions-table="actionsTable"
          :pagination-prop="pagination"
          @change-pagination="changePagination"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import HeaderActions from 'src/components/compose/HeaderActions.vue'
import GeneralTable from 'src/components/compose/GeneralTable.vue'
import ItemCard from 'src/components/atomic/ItemCard.vue'

export default defineComponent({
  name: 'ReportsPage',
  components: {
    HeaderActions,
    GeneralTable,
    ItemCard,
  },
  data() {
    return {
      delaySearch: 300,
      searchModel: null,
      timeoutSearch: null,
      loading: true,
      switchContent: 1,
      paramsFromCreated: false,
      subtitle: '',

      btnCloseWindow: {
        iconName: 'exit_to_app',
        btnBackground: '#FF990020',
        btnColor: '#FF9900',
        btnAction: this.goBack
      },

      btnAction: {
        show: true,
        btnTitle: 'Agregar reporte',
        tooltip: 'Agregar nuevo reporte',
        btnAction: this.goToAddReport,
        btnWidth: 'auto'
      },

      actionsTable: [
        {
          icnName: 'read_more',
          icnSize: 'sm',
          icnAction: 'Detail',
          tooltip: 'Detalle de reporte',
        },
        {
          icnName: 'engineering',
          icnSize: 'xs',
          icnAction: 'Maintenance',
          tooltip: 'Atender reporte',
          shouldHideAction: this.shouldHideAction
        },
      ],

      rowSelected: {},

      selectedFilterText: 'reason',

      inputSearch: {
        show: true,
        inputLabel: 'Buscar por reporte',
        setSelectedFilter: this.setSelectedFilter,
        setSelectedOptionFilter: this.setSelectedOptionFilter,
        heightModal: 160,
        items: [
          {
            title: 'Buscar por reporte',
            icon: 'o_bug_report',
            filter: 'reason'
          },
          {
            title: 'Encargado',
            icon: 'o_supervisor_account',
            filter: 'userName'
          },
          {
            title: 'Estatus',
            icon: 'o_engineering',
            options: [
              {
                title: 'Resuelto',
                filter: 'reportStatus',
                value: 'Resuelto'
              },
              {
                title: 'Pendiente',
                filter: 'reportStatus',
                value: 'Pendiente'
              },
              {
                title: 'Cancelado',
                filter: 'reportStatus',
                value: 'Cancelado'
              }
            ]
          }
        ]
      },

      params: {
        reason: '',
      },

      columns: [
        { name: 'reason', required: true, label: 'Motivo', align: 'left', field: row => row.reason, format: val => `${val}`, sortable: true },
        { name: 'encharged_name', label: 'Encargado', field: 'encharged_name', align: 'left', sortable: true },
        { name: 'badge-priority', label: 'Prioridad', field: 'reportUrgency', align: 'left', sortable: true },
        { name: 'date', label: 'Fecha del reporte', field: 'date', align: 'center', sortable: true },
        { name: 'badge', label: 'Estatus', field: 'status', align: 'center', sortable: true },
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
      ],

      localPagination: {
        totalPages: 1,
        descending: false,
        rowsPerPage: 20,
        page: 1,
      },
    }
  },

  mounted() {
    this.checkParamsFromCreated()

    if (this.$route?.query?.equipment) {
      this.subtitle = this.equipment?.categoryName
      this.params.IdEquipment = this.$route.query.equipment
      this.btnAction.show = this.equipment?.equipmentStatus

      this.params.page = 1
    } else if (this.$route?.query?.user) {
      this.subtitle = this.user?.userName
      this.params.userId = this.$route.query.user
    }

    this.getReports()
  },

  watch: {
    rowSelected: {
      handler(val) {
        if (val.action === 'Detail') {
          this.goToDetails(val.id);
        } else if (val.action === 'Maintenance') {
          this.goToMaintenance(val.id);
        }
      },
      deep: true,
    },

    searchModel(val) {
      if (!this.paramsFromCreated) {
        this.params = { ...this.params, [this.selectedFilterText]: val }
        clearTimeout(this.timeoutSearch);
        this.timeoutSearch = setTimeout(() => {

          this.params.page = 1

          this.getReports();
        }, this.delaySearch);
      }
    },

    selectedFilterText() {
      this.params.page = 1
    }
  },

  computed: {
    reports() {
      return this.$store.getters['reports/getReportsGetter'];
    },
    pagination() {
      return JSON.parse(JSON.stringify(this.$store.getters['reports/getPaginationGetter']));
    },
    localStorage() {
      return JSON.parse(JSON.stringify(this.$store.getters['global/getlocalStorageGetter']));
    },
    equipment() {
      return this.$store.getters['equipments/getEquipmentGetter'];
    },
    user() {
      return this.$store.getters['users/getUserGetter'];
    },

    cards() {
      return this.reports.map((e) => {
        // const indicator = this.findIndicator(e.status)
        return {
          id: e.id,
          cardTitle: e.reason,
          bottomStatus: this.findIndicator(e.status),
          cardLabels: [
            {
              label: 'Encargado',
              info: e.encharged_name,
            },
            {
              label: 'Prioridad',
              info: e.reportUrgency,
            }
          ],
        };
      });
    },
  },

  methods: {
    async getReports() {
      this.loading = true

      await this.$store.dispatch('reports/getReportsAction', this.params)

      this.paramsFromCreated = false

      this.localPagination = JSON.parse(JSON.stringify(this.pagination))

      const paramsForReports = { ...this.params }

      if (paramsForReports?.IdEquipment) {
        delete paramsForReports.IdEquipment
      }

      if (paramsForReports?.userId) {
        delete paramsForReports.userId
      }

      this.$store.dispatch('global/addGlobalsToLocalStorage', {
        searchReports: {
          inputLabel: this.inputSearch.inputLabel,
          selectedFilterText: this.selectedFilterText,
          searchModel: this.searchModel
        },
        paramsReportsPage: paramsForReports
      });

      this.loading = false
    },

    async checkParamsFromCreated() {
      if (this.localStorage?.paramsReportsPage) {
        this.params = { ...this.params, ...this.localStorage.paramsReportsPage };

        if (Object.prototype.hasOwnProperty.call(this.params, 'reportStatus')) {
          this.inputSearch.activeOptions = [await this.findItemByFilterAndValue(this.params.reportStatus)]
        }
      }

      if (this.localStorage?.searchReports) {
        this.paramsFromCreated = true

        this.inputSearch.inputLabel = this.localStorage.searchReports?.inputLabel
        this.searchModel = this.localStorage.searchReports?.searchModel
        this.selectedFilterText = this.localStorage.searchReports?.selectedFilterText
      }
    },

    shouldHideAction(row) {
      if (row?.reportStatus != 'Pendiente') {
        return false
      } else return true
    },

    findItemByFilterAndValue(value) {
      for (const item of this.inputSearch.items) {
        if (item.options) {
          const foundOption = item.options.find(option => option.value === value);
          if (foundOption) {
            return foundOption;
          }
        }
      }
      return null;
    },

    findIndicator(status) {
      if (status === 'Pendiente') {
        return {
          tooltip: 'El reporte está pendiente',
          color: '#FF9900',
          label: 'Pendiente'
        }
      } else if (status === 'Cancelado') {
        return {
          tooltip: 'El reporte ha sido cancelado',
          color: '#dc4e5f',
          label: 'Cancelado'
        }
      } else {
        return {
          tooltip: 'El reporte ha sido resuelto',
          color: '#1e65e8',
          label: 'Resuelto'
        }
      }
    },

    showCloseBtn() {
      return this.$route.query.equipment || this.$route.query.user
    },

    goToAddReport() {
      // Delete from the LOCAL STORAGE IF EXIST
      if (!this.$route.query.equipment) {
        this.$store.commit('equipments/MUTATE_EQUIPMENT', null)
      }

      this.$router.push({
        name: 'add-report'
      })
    },

    goBack() {
      this.$router.go(-1);
    },

    goToDetails(payload) {
      this.$router.push({ name: 'detail-report', params: { id: payload } });
    },

    async goToMaintenance(payload) {
      // Delete from the LOCAL STORAGE IF EXIST
      this.$store.commit('equipments/MUTATE_EQUIPMENT', null)

      const report = JSON.parse(JSON.stringify(this.reports.find(e => e.id == payload)))

      report.Equipment.equipmentName += ` - ${report.Equipment?.equipmentModel} - No. serie: ${report.Equipment.serialNumber}`

      this.$store.commit('reports/MUTATE_REPORT', report)

      this.$router.push({
        name: 'add-maintenance'
      });
    },

    goToEdit(payload) {
      this.$router.push({ name: 'edit-report', params: { id: payload } });
    },

    setSelectedFilter(opt) {
      // IF CHANGE THE MODEL SELECTED
      if (this.selectedFilterText) {
        delete this.params[this.selectedFilterText]
        if (this.searchModel) {
          this.params[opt.filter] = this.searchModel
          this.getReports();
        }
      }

      this.selectedFilterText = opt.filter
      this.inputSearch.inputLabel = opt.title;

      if (opt.value && opt.filter) {
        this.params[opt.filter] = this.searchModel
        this.getReports();
      }
    },

    setSelectedOptionFilter(activeFilters, removedFilter = null) {
      if (activeFilters.length) {
        activeFilters.forEach(item => {
          this.params[item.filter] = item.value
        })
      }
      if (removedFilter) {
        delete this.params[removedFilter]
      }

      this.params.page = 1

      this.getReports();
    },

    changePagination(pagination) {
      this.localPagination.page = pagination

      this.params = {
        ...this.params, ...{
          page: this.localPagination.page,
          rowsPerPage: this.localPagination.rowsPerPage,
        }
      }

      this.getReports();
    }
  },
})
</script>
