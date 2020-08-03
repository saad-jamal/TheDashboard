/** The PfdMemory is an object that stores the relevant sim data
 *  variables for the PFD component.
 *
 *  @author Saad Jamal
 */
export interface PfdMemory {
    at_eng_mode: string;
    fo_roll_eng: string;
    fo_roll_arm: string;
    fo_pit_eng: string;
    fo_pit_arm: string;

    fo_cws_pit: boolean;
    fo_cws_roll: boolean;
    mcp_fd_2: boolean;

    fo_ap_stat: string;

    fo_cmd_pit_dev: number;
    fo_cmd_roll_dev: number;
    ils_2_gs_dev: number;
    ils_2_loc_dev: number;
    mcp_ias_mach_ds: number;
    mcp_alt_ds: number;
    mcp_vert_spd_ds: number;
    fo_ef_baro_cur: number;
    cal_as: number;
    rate_of_clb: number;
    pres_alt: number;
    radio_alt: number;
    pitch_angle: number;
    roll_angle: number;
    hdg_angle: number;
    mcp_hdg_ds: number;
    mag_track_angle: number;
}
