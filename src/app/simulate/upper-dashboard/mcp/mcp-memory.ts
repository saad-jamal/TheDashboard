/* The McpMemory is an object that stores the relevant sim data
 * variables for the MCP component.
 *
 * @author Saad Jamal
 */
export interface McpMemory {
    // Displays
    mcp_ias_mach_ds: number;
    mcp_hdg_ds: number;
    mcp_alt_ds: number;
    mcp_vert_spd_ds: number;
    mcp_crs_1_ds: number;
    mcp_crs_2_ds: number;

    // Buttons
    mcp_n1: boolean;
    mcp_spd: boolean;
    mcp_lvl_spd: boolean;
    mcp_vnav: boolean;
    mcp_lnav: boolean;
    mcp_vor_loc: boolean;
    mcp_apprh: boolean;
    mcp_hdg_sel: boolean;
    mcp_alt_hld: boolean;
    mcp_vert_spd: boolean;
    mcp_cmd_a: boolean;
    mcp_cmd_b: boolean;
    mcp_cws_a: boolean;
    mcp_cws_b: boolean;

    // Switches
    mcp_fd_1: boolean;
    mcp_fd_2: boolean;
    mcp_at_arm: boolean;
}