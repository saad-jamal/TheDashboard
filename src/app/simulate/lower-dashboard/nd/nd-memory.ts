/* The NdMemory is an object that stores the relevant sim data
 * variables for the ND component.
 *
 * @author Saad Jamal
 */
export interface NdMemory {
    fo_ef_nd_mode: number;
    fo_ef_rnge: number;
    true_as: number;
    gnd_spd: number;
    hdg_angle: number;
    lat: number;
    long: number;
    mag_track_angle: number;
    mag_hdg_angle: number;
    wind_dir_at_ac: number;
    wind_spd_at_ac: number;
    rnp_vert: number;
    anp_vert: number;
    rnp_lat: number;
    anp_lat: number;

    fo_vsd_on: boolean;
    fo_bel_gs_lt: boolean;

    VSD_terrain: number[];
    pitch_angle: number;
    pres_alt: number;
    mcp_alt_ds: number;
}