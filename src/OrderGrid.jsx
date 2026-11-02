import { Box, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { describeLines } from "./orderLogic";

const STATUS_COLOR = { preparing: "warning", ready: "success" };

function StatusChip({ value }) {
  return <Chip size="small" label={value} color={STATUS_COLOR[value] ?? "default"} variant="outlined" sx={{ textTransform: "capitalize" }} />;
}

/**
 * The internal order-management table. MUI's DataGrid gives sorting, filtering and
 * pagination for free. Its colors and spacing come from the shared theme (src/theme.js).
 * `virtualize={false}` is for tests only: jsdom has no layout, so a virtual grid would show no rows.
 */
export default function OrderGrid({ orders, menu, virtualize = true }) {
  const rows = orders.map((o) => ({ id: o.id, table: o.table, items: describeLines(o.lines, menu), total: o.total, status: o.status }));

  const columns = [
    { field: "id", headerName: "Order #", width: 100 },
    { field: "table", headerName: "Table", type: "number", width: 90 },
    { field: "items", headerName: "Items", flex: 1, minWidth: 200 },
    { field: "total", headerName: "Total", type: "number", width: 110, valueFormatter: (value) => `₹${value}` },
    { field: "status", headerName: "Status", width: 130, renderCell: ({ value }) => <StatusChip value={value} /> },
  ];

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 3 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        disableVirtualization={!virtualize}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10]}
        initialState={{ pagination: { paginationModel: { pageSize: 5 } }, sorting: { sortModel: [{ field: "id", sort: "desc" }] } }}
        localeText={{ noRowsLabel: "No orders yet" }}
        aria-label="Orders"
      />
    </Box>
  );
}
