import { useState } from "react";
import {
  Truck,
  Plus,
  PackageCheck,
  PlaneTakeoff,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

import PageHeader from "../../components/common/PageHeader.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import { TextField, SelectField } from "../../components/common/FormField.jsx";

import {
  useListVehiclesQuery,
  useCreateVehicleMutation,

  useListDeliveryOrdersQuery,
  useCreateDeliveryOrderMutation,
  useApproveDeliveryOrderMutation,
  useIssueDeliveryOrderMutation,

  useListUldAllocationsQuery,
  useAllocateUldMutation,

  useListFlightLoadingQuery,
  useLoadFlightMutation,

  useListCargoMovementsQuery,
  useRecordCargoMovementMutation,
} from "../../services/operationsApi.js";

import { CanWrite } from "../../components/common/Access.jsx";
import { useListAirShipmentsQuery } from "../../services/airCargoApi.js";


export default function OperationsPage() {
  const [tab, setTab] = useState("vehicles");

  const tabs = [
    ["vehicles", "Vehicles"],
    ["delivery", "Delivery Orders"],
    ["uld", "ULD Allocation"],
    ["loading", "Flight Loading"],
    ["movements", "Cargo Movements"],
  ];

  return (
    <div>
      <PageHeader
        title="Operations Control"
        description="Vehicle movements, delivery orders, ULD allocation, flight loading and cargo movements."
      />

      <div className="mb-5 flex flex-wrap gap-1 rounded-md bg-ink/5 p-1 w-fit">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded px-3 py-1.5 text-xs font-bold ${
              tab === key
                ? "bg-white shadow-sm text-ink"
                : "text-ink/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "vehicles" && <Vehicles />}
      {tab === "delivery" && <DeliveryOrders />}
      {tab === "uld" && <ULD />}
      {tab === "loading" && <FlightLoading />}
      {tab === "movements" && <Movements />}
    </div>
  );
}


/* =========================================================
   VEHICLES
========================================================= */

function Vehicles() {
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } =
    useListVehiclesQuery({ limit: 50 });

  const [create, { isLoading: creating }] =
    useCreateVehicleMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicleType: "truck",
    },
  });

  const submit = async (formData) => {
    console.log("VEHICLE PAYLOAD:", formData);

    try {
      await create({
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        driverName: formData.driverName || undefined,
        transporterName: formData.transporterName || undefined,
      }).unwrap();

      toast.success("Vehicle created");
      reset();
      setOpen(false);
    } catch (e) {
      console.error("VEHICLE ERROR:", e);
      toast.error(
        e?.data?.message || "Could not create vehicle"
      );
    }
  };

  return (
    <section>
      <Toolbar
        title="Vehicle Gate & Tracking"
        onAdd={() => setOpen(true)}
        module="operations"
      />

      <DataTable
        columns={[
          {
            header: "Vehicle",
            accessor: (r) => (
              <span className="tag-number">
                {r.vehicleNumber || "—"}
              </span>
            ),
          },
          {
            header: "Driver",
            accessor: (r) => r.driverName || "—",
          },
          {
            header: "Type",
            accessor: (r) => r.vehicleType || "—",
          },
          {
            header: "Transporter",
            accessor: (r) => r.transporterName || "—",
          },
          {
            header: "Status",
            accessor: (r) => r.status || "—",
          },
          {
            header: "Last Location",
            accessor: (r) => r.lastLocation || "—",
          },
        ]}
        rows={data?.data || []}
        isLoading={isLoading}
        isError={isError}
      />

      <Modal
        open={open}
        onClose={() => {
          reset();
          setOpen(false);
        }}
        title="Add Vehicle"
      >
        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="grid grid-cols-2 gap-x-3">

            <TextField
              label="Vehicle Number"
              required
              placeholder="GJ01AB1234"
              {...register("vehicleNumber", {
                required: "Vehicle number is required",
              })}
              error={errors.vehicleNumber}
            />

            <SelectField
              label="Vehicle Type"
              required
              {...register("vehicleType", {
                required: "Vehicle type is required",
              })}
              error={errors.vehicleType}
            >
              <option value="truck">Truck</option>
              <option value="trailer">Trailer</option>
              <option value="van">Van</option>
              <option value="other">Other</option>
            </SelectField>

            <TextField
              label="Driver Name"
              placeholder="Driver name"
              {...register("driverName")}
            />

            <TextField
              label="Transporter"
              placeholder="Transporter name"
              {...register("transporterName")}
            />

          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              icon={Truck}
              disabled={creating}
            >
              {creating ? "Saving..." : "Save Vehicle"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}


/* =========================================================
   DELIVERY ORDERS
========================================================= */

function DeliveryOrders() {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useListDeliveryOrdersQuery({
    limit: 50,
  });

  const {
    data: airData,
    isLoading: airLoading,
  } = useListAirShipmentsQuery({
    limit: 50,
  });

  const airShipments = airData?.data || [];

  const [create, { isLoading: creating }] =
    useCreateDeliveryOrderMutation();

  const [approve] =
    useApproveDeliveryOrderMutation();

  const [issue] =
    useIssueDeliveryOrderMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const referenceType = watch("referenceType");

  const submit = async (formData) => {
    console.log("DELIVERY ORDER PAYLOAD:", formData);

    try {
      await create({
        referenceType: formData.referenceType,
        referenceId: formData.referenceId,
        issuedTo: formData.issuedTo || undefined,
        expiresAt: formData.expiresAt || undefined,
        remarks: formData.remarks || undefined,
      }).unwrap();

      toast.success("Delivery Order created");

      reset();
      setOpen(false);
    } catch (e) {
      console.error("DELIVERY ORDER ERROR:", e);

      toast.error(
        e?.data?.message || "Could not create delivery order"
      );
    }
  };

  const handleApprove = async (id) => {
    try {
      await approve(id).unwrap();
      toast.success("Delivery Order approved");
    } catch (e) {
      toast.error(
        e?.data?.message || "Approval failed"
      );
    }
  };

  const handleIssue = async (id) => {
    try {
      await issue(id).unwrap();
      toast.success("Delivery Order issued");
    } catch (e) {
      toast.error(
        e?.data?.message || "Issue failed"
      );
    }
  };

  return (
    <section>
      <Toolbar
        title="Delivery Orders"
        onAdd={() => setOpen(true)}
        module="operations"
      />

      <DataTable
        columns={[
          {
            header: "Order",
            accessor: (r) => (
              <span className="tag-number">
                {r.orderNumber || r.id || "—"}
              </span>
            ),
          },
          {
            header: "Reference",
            accessor: (r) =>
              `${r.referenceType || "—"} / ${
                r.referenceId || "—"
              }`,
          },
          {
            header: "Issued To",
            accessor: (r) => r.issuedTo || "—",
          },
          {
            header: "Status",
            accessor: (r) => r.status || "—",
          },
          {
            header: "Actions",
            accessor: (r) => (
              <div className="flex gap-1">

                {r.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => handleApprove(r.id)}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    Approve
                  </button>
                )}

                {r.status === "approved" && (
                  <button
                    type="button"
                    onClick={() => handleIssue(r.id)}
                    className="rounded bg-ink px-2 py-1 text-xs text-white"
                  >
                    Issue
                  </button>
                )}

              </div>
            ),
          },
        ]}
        rows={data?.data || []}
        isLoading={isLoading}
        isError={isError}
      />

      <Modal
        open={open}
        onClose={() => {
          reset();
          setOpen(false);
        }}
        title="Create Delivery Order"
      >
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
        >

          {/* REFERENCE TYPE */}

          <SelectField
            label="Reference Type"
            required
            {...register("referenceType", {
              required: "Reference type is required",
            })}
            error={errors.referenceType}
          >
            <option value="">
              Select reference type
            </option>

            <option value="air_shipment">
              Air Shipment
            </option>

            <option value="container">
              Container
            </option>

            <option value="courier_shipment">
              Courier Shipment
            </option>
          </SelectField>


          {/* AIR SHIPMENT */}

          {referenceType === "air_shipment" && (
            <SelectField
              label="Air Shipment"
              required
              disabled={airLoading}
              {...register("referenceId", {
                required: "Air shipment is required",
              })}
              error={errors.referenceId}
            >
              <option value="">
                {airLoading
                  ? "Loading shipments..."
                  : "Select Air Shipment"}
              </option>

              {airShipments.map((shipment) => (
                <option
                  key={shipment.id || shipment._id}
                  value={shipment.id || shipment._id}
                >
                  {shipment.awbNumber || "No AWB"}
                  {" - "}
                  {shipment.originAirport || "—"}
                  {" → "}
                  {shipment.destinationAirport || "—"}
                </option>
              ))}
            </SelectField>
          )}


          {/* CONTAINER */}

          {referenceType === "container" && (
            <TextField
              label="Container Reference ID"
              required
              placeholder="Mongo ObjectId"
              {...register("referenceId", {
                required:
                  "Container reference ID is required",
              })}
              error={errors.referenceId}
            />
          )}


          {/* COURIER */}

          {referenceType === "courier_shipment" && (
            <TextField
              label="Courier Shipment Reference ID"
              required
              placeholder="Mongo ObjectId"
              {...register("referenceId", {
                required:
                  "Courier shipment reference ID is required",
              })}
              error={errors.referenceId}
            />
          )}


          <TextField
            label="Issued To"
            placeholder="Customer / receiver name"
            {...register("issuedTo")}
          />

          <TextField
            label="Expires At"
            type="date"
            {...register("expiresAt")}
          />

          <TextField
            label="Remarks"
            placeholder="Remarks"
            {...register("remarks")}
          />


          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              icon={PackageCheck}
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create DO"}
            </Button>
          </div>

        </form>
      </Modal>
    </section>
  );
}


/* =========================================================
   ULD ALLOCATION
========================================================= */

function ULD() {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useListUldAllocationsQuery({
    limit: 50,
  });

  const {
    data: airData,
    isLoading: airLoading,
  } = useListAirShipmentsQuery({
    limit: 50,
  });

  const airShipments = airData?.data || [];

  const [create, { isLoading: creating }] =
    useAllocateUldMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const submit = async (formData) => {
    console.log("ULD PAYLOAD:", formData);

    try {
      await create({
        airShipmentId: formData.airShipmentId,
        uldNumber: formData.uldNumber,
        position: formData.position || undefined,
      }).unwrap();

      toast.success("ULD allocated");

      reset();
      setOpen(false);
    } catch (e) {
      console.error("ULD ERROR:", e);

      toast.error(
        e?.data?.message || "ULD allocation failed"
      );
    }
  };

  return (
    <section>
      <Toolbar
        title="ULD Allocation"
        onAdd={() => setOpen(true)}
        module="operations"
      />

      <DataTable
        columns={[
          {
            header: "ULD",
            accessor: (r) => (
              <span className="tag-number">
                {r.uldNumber || "—"}
              </span>
            ),
          },
          {
            header: "Shipment",
            accessor: (r) =>
              r.airShipmentId || "—",
          },
          {
            header: "Position",
            accessor: (r) =>
              r.position || "—",
          },
          {
            header: "Status",
            accessor: (r) =>
              r.status || "—",
          },
        ]}
        rows={data?.data || []}
        isLoading={isLoading}
        isError={isError}
      />

      <Modal
        open={open}
        onClose={() => {
          reset();
          setOpen(false);
        }}
        title="Allocate ULD"
      >
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
        >

          <SelectField
            label="Air Shipment"
            required
            disabled={airLoading}
            {...register("airShipmentId", {
              required: "Air shipment is required",
            })}
            error={errors.airShipmentId}
          >
            <option value="">
              {airLoading
                ? "Loading shipments..."
                : "Select Air Shipment"}
            </option>

            {airShipments.map((shipment) => (
              <option
                key={shipment.id || shipment._id}
                value={shipment.id || shipment._id}
              >
                {shipment.awbNumber || "No AWB"}
                {" - "}
                {shipment.originAirport || "—"}
                {" → "}
                {shipment.destinationAirport || "—"}
              </option>
            ))}
          </SelectField>


          <TextField
            label="ULD Number"
            required
            placeholder="AKE12345"
            {...register("uldNumber", {
              required: "ULD number is required",
            })}
            error={errors.uldNumber}
          />


          <SelectField
            label="Position"
            {...register("position")}
          >
            <option value="">
              Select position
            </option>
            <option value="forward">
              Forward
            </option>
            <option value="aft">
              Aft
            </option>
            <option value="center">
              Center
            </option>
            <option value="lower_deck">
              Lower Deck
            </option>
            <option value="main_deck">
              Main Deck
            </option>
          </SelectField>


          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              icon={PackageCheck}
              disabled={creating}
            >
              {creating
                ? "Allocating..."
                : "Allocate ULD"}
            </Button>
          </div>

        </form>
      </Modal>
    </section>
  );
}


/* =========================================================
   FLIGHT LOADING
========================================================= */

function FlightLoading() {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useListFlightLoadingQuery({
    limit: 50,
  });

  const {
    data: airData,
    isLoading: airLoading,
  } = useListAirShipmentsQuery({
    limit: 50,
  });

  const airShipments = airData?.data || [];

  const [create, { isLoading: creating }] =
    useLoadFlightMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const submit = async (formData) => {
    console.log("FLIGHT LOADING PAYLOAD:", formData);

    try {
      await create({
        airShipmentId: formData.airShipmentId,
        flightNumber: formData.flightNumber,
      }).unwrap();

      toast.success("Flight loading recorded");

      reset();
      setOpen(false);
    } catch (e) {
      console.error("FLIGHT LOADING ERROR:", e);

      toast.error(
        e?.data?.message || "Flight loading failed"
      );
    }
  };

  return (
    <section>
      <Toolbar
        title="Flight Loading"
        onAdd={() => setOpen(true)}
        module="operations"
      />

      <DataTable
        columns={[
          {
            header: "Loading No.",
            accessor: (r) => (
              <span className="tag-number">
                {r.loadingNumber || r.id || "—"}
              </span>
            ),
          },
          {
            header: "Shipment",
            accessor: (r) =>
              r.airShipmentId || "—",
          },
          {
            header: "Flight",
            accessor: (r) =>
              r.flightNumber || "—",
          },
          {
            header: "Status",
            accessor: (r) =>
              r.status || "—",
          },
        ]}
        rows={data?.data || []}
        isLoading={isLoading}
        isError={isError}
      />

      <Modal
        open={open}
        onClose={() => {
          reset();
          setOpen(false);
        }}
        title="Record Flight Loading"
      >
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
        >

          <SelectField
            label="Air Shipment"
            required
            disabled={airLoading}
            {...register("airShipmentId", {
              required: "Air shipment is required",
            })}
            error={errors.airShipmentId}
          >
            <option value="">
              {airLoading
                ? "Loading shipments..."
                : "Select Air Shipment"}
            </option>

            {airShipments.map((shipment) => (
              <option
                key={shipment.id || shipment._id}
                value={shipment.id || shipment._id}
              >
                {shipment.awbNumber || "No AWB"}
                {" - "}
                {shipment.originAirport || "—"}
                {" → "}
                {shipment.destinationAirport || "—"}
              </option>
            ))}
          </SelectField>


          <TextField
            label="Flight Number"
            required
            placeholder="AI-402"
            {...register("flightNumber", {
              required: "Flight number is required",
            })}
            error={errors.flightNumber}
          />


          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              icon={PlaneTakeoff}
              disabled={creating}
            >
              {creating
                ? "Recording..."
                : "Record Loading"}
            </Button>
          </div>

        </form>
      </Modal>
    </section>
  );
}


/* =========================================================
   CARGO MOVEMENTS
========================================================= */

function Movements() {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useListCargoMovementsQuery({
    limit: 50,
  });

  const {
    data: airData,
    isLoading: airLoading,
  } = useListAirShipmentsQuery({
    limit: 50,
  });

  const airShipments = airData?.data || [];

  const [create, { isLoading: creating }] =
    useRecordCargoMovementMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const referenceType = watch("referenceType");

  const submit = async (formData) => {
    console.log("CARGO MOVEMENT PAYLOAD:", formData);

    try {
      await create({
        referenceType: formData.referenceType,
        referenceId: formData.referenceId,
        movementType: formData.movementType,
        location: formData.location,
      }).unwrap();

      toast.success("Cargo movement recorded");

      reset();
      setOpen(false);
    } catch (e) {
      console.error("CARGO MOVEMENT ERROR:", e);

      toast.error(
        e?.data?.message || "Movement failed"
      );
    }
  };

  return (
    <section>
      <Toolbar
        title="Cargo Movement Log"
        onAdd={() => setOpen(true)}
        module="operations"
      />

      <DataTable
        columns={[
          {
            header: "Reference",
            accessor: (r) =>
              `${r.referenceType || "—"} / ${
                r.referenceId || "—"
              }`,
          },
          {
            header: "Movement",
            accessor: (r) =>
              r.movementType || "—",
          },
          {
            header: "Location",
            accessor: (r) =>
              r.location || "—",
          },
          {
            header: "Time",
            accessor: (r) =>
              r.createdAt
                ? new Date(
                    r.createdAt
                  ).toLocaleString()
                : "—",
          },
        ]}
        rows={data?.data || []}
        isLoading={isLoading}
        isError={isError}
      />

      <Modal
        open={open}
        onClose={() => {
          reset();
          setOpen(false);
        }}
        title="Record Cargo Movement"
      >
        <form
          onSubmit={handleSubmit(submit)}
          noValidate
        >

          <SelectField
            label="Reference Type"
            required
            {...register("referenceType", {
              required: "Reference type is required",
            })}
            error={errors.referenceType}
          >
            <option value="">
              Select reference type
            </option>

            <option value="air_shipment">
              Air Shipment
            </option>

            <option value="container">
              Container
            </option>

            <option value="courier_shipment">
              Courier Shipment
            </option>
          </SelectField>


          {referenceType === "air_shipment" && (
            <SelectField
              label="Air Shipment"
              required
              disabled={airLoading}
              {...register("referenceId", {
                required: "Air shipment is required",
              })}
              error={errors.referenceId}
            >
              <option value="">
                {airLoading
                  ? "Loading shipments..."
                  : "Select Air Shipment"}
              </option>

              {airShipments.map((shipment) => (
                <option
                  key={shipment.id || shipment._id}
                  value={shipment.id || shipment._id}
                >
                  {shipment.awbNumber || "No AWB"}
                  {" - "}
                  {shipment.originAirport || "—"}
                  {" → "}
                  {shipment.destinationAirport || "—"}
                </option>
              ))}
            </SelectField>
          )}


          {referenceType === "container" && (
            <TextField
              label="Container Reference ID"
              required
              placeholder="Mongo ObjectId"
              {...register("referenceId", {
                required:
                  "Container reference ID is required",
              })}
              error={errors.referenceId}
            />
          )}


          {referenceType === "courier_shipment" && (
            <TextField
              label="Courier Reference ID"
              required
              placeholder="Mongo ObjectId"
              {...register("referenceId", {
                required:
                  "Courier reference ID is required",
              })}
              error={errors.referenceId}
            />
          )}


          <SelectField
            label="Movement Type"
            required
            {...register("movementType", {
              required: "Movement type is required",
            })}
            error={errors.movementType}
          >
            <option value="">
              Select movement
            </option>

            <option value="gate_in">
              Gate In
            </option>

            <option value="gate_out">
              Gate Out
            </option>

            <option value="received">
              Received
            </option>

            <option value="released">
              Released
            </option>

            <option value="loaded">
              Loaded
            </option>

            <option value="unloaded">
              Unloaded
            </option>

            <option value="transferred">
              Transferred
            </option>
          </SelectField>


          <TextField
            label="Location"
            placeholder="Warehouse / Gate / Terminal"
            {...register("location")}
          />


          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              icon={MapPin}
              disabled={creating}
            >
              {creating
                ? "Saving..."
                : "Record Movement"}
            </Button>
          </div>

        </form>
      </Modal>
    </section>
  );
}


/* =========================================================
   TOOLBAR
========================================================= */

function Toolbar({
  title,
  onAdd,
  module,
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold">
        {title}
      </h2>

      {onAdd && (
        <CanWrite module={module}>
          <Button
            icon={Plus}
            onClick={onAdd}
          >
            Add
          </Button>
        </CanWrite>
      )}
    </div>
  );
}