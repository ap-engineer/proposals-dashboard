// Based on Proposales API v3 response structure
export interface Proposal {
    uuid: string;
    title?: string;
    title_md?: string;
    status?: string;
    created_at?: number; // unix timestamp in seconds
    updated_at?: number;
    company_id?: number;
    company_name?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    series_uuid?: string;
    version?: number;
    data?: Record<string, any>;
}

export interface ProposalDetail extends Proposal {
    description_html?: string;
    description_md?: string;
    archived_at?: number;
    attachments?: any[];
    background_image?: {
        id: number;
        uuid: string;
    };
    background_video?: {
        id: number;
        uuid: string;
    };
    blocks?: any[];
    company_logo_uuid?: string;
    company_powerups?: Record<string, any>;
    company_powerups_live?: Record<string, any>;
    company_registration_number?: string;
    company_tax_mode_live?: string;
    company_timezone?: string;
    company_avatar_uuid?: string;
    contact_email?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_title?: string;
    creator_id?: number;
    creator_name?: string;
    currency?: string;
    editor?: {
        notification_user_ids?: Record<string, any>;
    };
    expires_at?: number;
    invoicing?: Record<string, any>;
    is_agreement?: boolean;
    is_only_proposal_in_series?: boolean;
    is_test?: boolean;
    pending?: boolean;
    pending_reason?: string;
    recipient_company_name?: string;
    recipient_email?: string;
    recipient_id?: number;
    recipient_is_set?: boolean;
    recipient_name?: string;
    recipient_phone?: string;
    recipient_sources?: Record<string, any>;
    signatures?: any[];
    status_changed_at?: number;
    tax_options?: Record<string, any>;
    tracking?: Record<string, any>;
    value_with_tax?: number;
    value_without_tax?: number;
    payments_enabled?: boolean;
    contact_avatar_transform?: string;
    user_email?: string;
    payment?: Record<string, any>;
    language?: string;
    background_image_uuid?: string;
}

// API response wrapper
export interface ApiResponse<T> {
    data: T;
}

export type ProposalsSearchResponse = ApiResponse<Proposal | Proposal[]>;
export type ProposalGetResponse = ApiResponse<ProposalDetail>;