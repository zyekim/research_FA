<script setup lang="ts">
import { ref, computed } from "vue";

// ── Data helpers
function makeUsers(n, offset = 0) {
  return Array.from({ length: n }, (_, i) => ({
    id: offset + i + 1,
    name: [
      "김민준",
      "이서연",
      "박지훈",
      "최수빈",
      "정예준",
      "강하은",
      "윤도현",
      "임지수",
      "오서준",
      "한수아",
    ][i % 10],
    email: `user${offset + i + 1}@example.com`,
    department: ["개발", "디자인", "마케팅", "영업", "인사"][(offset + i) % 5],
    age: 20 + ((offset + i) % 30),
    status: (offset + i) % 3 == 0 ? "비활성" : "활성",
    score: Math.floor(Math.random() * 100),
  }));
}

// ── Table ①
const page = ref(1);
const pageSize = ref(10);
const selectedKeys = ref([]);
const allUsers = makeUsers(100);
const pagedRows = computed(() =>
  allUsers.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

const columns = [
  { key: "id", label: "ID", width: "60px", sortable: true, align: "center" },
  { key: "name", label: "이름", width: "140px", sortable: true },
  { key: "email", label: "이메일", minWidth: "200px", ellipsis: true },
  { key: "department", label: "부서", width: "100px", sortable: true },
  { key: "age", label: "나이", width: "70px", sortable: true, align: "right" },
  { key: "status", label: "상태", width: "90px", align: "center" },
  {
    key: "score",
    label: "점수",
    width: "80px",
    align: "right",
    formatter: (v: number) => v?.toLocaleString(),
  },
];

// ── Table ②
const page2 = ref(1);
const pageSize2 = ref(10);
const radioSelected = ref([]);
const allUsers2 = makeUsers(30);
const pagedRows2 = computed(() =>
  allUsers2.slice(
    (page2.value - 1) * pageSize2.value,
    page2.value * pageSize2.value
  )
);
const simpleColumns = [
  { key: "id", label: "ID", width: "60px", align: "center" },
  { key: "name", label: "이름", width: "120px" },
  { key: "department", label: "부서", width: "100px" },
  { key: "age", label: "나이", width: "70px", align: "right" },
  { key: "status", label: "상태", width: "80px", align: "center" },
];

// ── Table ③ Tree
const treeData = [
  {
    id: 1,
    name: "경영지원",
    role: "본부",
    salary: "-",
    children: [
      {
        id: 11,
        name: "인사팀",
        role: "팀",
        salary: "4,200만원",
        children: [
          { id: 111, name: "김철수", role: "사원", salary: "3,600만원" },
          { id: 112, name: "이영희", role: "대리", salary: "4,000만원" },
        ],
      },
      {
        id: 12,
        name: "총무팀",
        role: "팀",
        salary: "4,000만원",
        children: [
          { id: 121, name: "박민수", role: "사원", salary: "3,500만원" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "개발본부",
    role: "본부",
    salary: "-",
    children: [
      {
        id: 21,
        name: "프론트팀",
        role: "팀",
        salary: "5,500만원",
        children: [
          { id: 211, name: "정지원", role: "시니어", salary: "7,000만원" },
          { id: 212, name: "한나연", role: "주니어", salary: "4,500만원" },
        ],
      },
      { id: 22, name: "백엔드팀", role: "팀", salary: "5,800만원" },
    ],
  },
];
const treeColumns = [
  { key: "name", label: "이름/조직", minWidth: "200px" },
  { key: "role", label: "직급/구분", width: "100px" },
  { key: "salary", label: "연봉", width: "120px", align: "right" },
];

// ── Table ④ Group
const groupData = [
  ...makeUsers(3, 0).map((u) => ({ ...u, department: "개발" })),
  ...makeUsers(2, 10).map((u) => ({ ...u, department: "디자인" })),
  ...makeUsers(4, 20).map((u) => ({ ...u, department: "마케팅" })),
];

// ── Event handlers
function onSort(s) {
  console.log("sort", s);
}
function onPageChange(p) {
  console.log("page", p);
}
function onRowClick(r) {
  console.log("row click", r);
}
function onSelectionChange(k) {
  console.log("selected", k);
}
function alert(target: string) {
  window.alert(target);
}
</script>
<template>
  <div style="padding: 24px; background: #f5f7fa; min-height: 100vh">
    <h2 style="margin-bottom: 24px; font-family: sans-serif">
      GlobalTable Demo
    </h2>

    <!-- ① 기본 API 페이징 테이블 (checkbox + row number + action + excel) -->
    <section style="margin-bottom: 40px">
      <h3 style="font-family: sans-serif; margin-bottom: 12px">
        ① 기본 테이블 (Checkbox + RowNumber + Action + Excel)
      </h3>
      <CLGrid
        v-model:currentPage="page"
        v-model:pageSize="pageSize"
        v-model:selectedKeys="selectedKeys"
        :rows="pagedRows"
        :columns="columns"
        :total-count="100"
        :loading="false"
        selection-type="checkbox"
        :row-number="true"
        :excel-export="true"
        excel-file-name="user-list"
        :disabled-keys="[3]"
        row-key="id"
        table-max-height="400px"
        :show-footer="true"
        @sort-change="onSort"
        @page-change="onPageChange"
        @row-click="onRowClick"
        @selection-change="onSelectionChange"
      >
        <template #toolbar-left>
          <span style="font-size: 13px; color: #718096"
            >선택: {{ selectedKeys.length }}건</span
          >
          <v-text-field></v-text-field>
        </template>

        <!-- Inline input cell -->
        <template #cell-name="{ row, value }">
          <input
            :value="value"
            class="gt-inline-input"
            @input="row.name = $event.target.value"
            @click.stop
          />
        </template>

        <!-- Status badge -->
        <template #cell-status="{ value }">
          <span
            :class="['status-badge', value == '활성' ? 'active' : 'inactive']"
          >
            {{ value }}
          </span>
        </template>

        <!-- Action slot -->
        <template #action="{ row }">
          <button
            class="act-btn edit"
            @click.stop="alert('Edit: ' + row.id)"
          >
            수정
          </button>
          <button
            class="act-btn del"
            @click.stop="alert('Del: ' + row.id)"
          >
            삭제
          </button>
        </template>

        <!-- Footer -->
        <template #footer>
          <span style="font-size: 12px; color: #718096"
            >합계: 100건 | 평균 나이: 32세</span
          >
        </template>
      </CLGrid>
    </section>

    <!-- ② Radio 테이블 -->
    <section style="margin-bottom: 40px">
      <h3 style="font-family: sans-serif; margin-bottom: 12px">
        ② Radio 선택 테이블
      </h3>
      <CLGrid
        v-model:currentPage="page2"
        v-model:pageSize="pageSize2"
        v-model:selectedKeys="radioSelected"
        :rows="pagedRows2"
        :columns="simpleColumns"
        :total-count="30"
        selection-type="radio"
        row-key="id"
        table-max-height="300px"
        :pagination="true"
      />
    </section>

    <!-- ③ Tree 테이블 -->
    <section style="margin-bottom: 40px">
      <h3 style="font-family: sans-serif; margin-bottom: 12px">
        ③ Tree 구조 테이블
      </h3>
      <CLGrid
        :rows="treeData"
        :columns="treeColumns"
        :pagination="false"
        :tree-mode="true"
        tree-indent-column="name"
        row-key="id"
        table-max-height="360px"
        :show-toolbar="false"
      />
    </section>

    <!-- ④ Row Grouping 테이블 -->
    <section style="margin-bottom: 40px">
      <h3 style="font-family: sans-serif; margin-bottom: 12px">
        ④ Row Grouping 테이블
      </h3>
      <CLGrid
        :rows="groupData"
        :columns="simpleColumns"
        :pagination="false"
        group-by="department"
        row-key="id"
        table-max-height="360px"
        :show-toolbar="false"
      />
    </section>
  </div>
</template>

<style scoped>
.gt-inline-input {
  border: 1px solid #e2e6ea;
  border-radius: 4px;
  background: #fff;
  padding: 4px 8px;
  width: 100%;
  font-size: 13px;
  font-family: inherit;
}
.gt-inline-input:focus {
  outline: none;
  border-color: #5c6bc0;
}

.status-badge {
  display: inline-block;
  border-radius: 12px;
  padding: 2px 10px;
  font-weight: 600;
  font-size: 11px;
}
.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}
.status-badge.inactive {
  background: #fce4ec;
  color: #c62828;
}

.act-btn {
  cursor: pointer;
  margin: 0 2px;
  border: 1px solid;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 11px;
  font-family: inherit;
}
.act-btn.edit {
  border-color: #bbdefb;
  background: #e3f2fd;
  color: #1565c0;
}
.act-btn.edit:hover {
  background: #1565c0;
  color: #fff;
}
.act-btn.del {
  border-color: #ffcdd2;
  background: #ffebee;
  color: #c62828;
}
.act-btn.del:hover {
  background: #c62828;
  color: #fff;
}
</style>
