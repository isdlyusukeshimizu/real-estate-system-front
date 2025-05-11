from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.api import deps
from app.models.user import User
from app.core.external_services import PostalCodeService, PhoneNumberService, RegistryLibraryService

router = APIRouter()

postal_code_service = PostalCodeService()
phone_number_service = PhoneNumberService()

@router.get("/postal-code/{postal_code}")
def lookup_postal_code(
    *,
    postal_code: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Look up address details by postal code.
    """
    result = postal_code_service.lookup(postal_code)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result

@router.get("/phone-number/{phone_number}")
def lookup_phone_number(
    *,
    phone_number: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Look up details by phone number.
    """
    result = phone_number_service.lookup(phone_number)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result

@router.post("/registry-library/login")
def registry_library_login(
    *,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Log in to the Registry Library website.
    """
    registry_service = RegistryLibraryService(
        username="example_username",
        password="example_password"
    )
    
    result = registry_service.login()
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Failed to log in to Registry Library")
        )
    
    return result

@router.post("/registry-library/search")
def registry_library_search(
    *,
    name: Optional[str] = None,
    address: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Search for registry information based on criteria.
    """
    if not name and not address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one search criterion (name or address) must be provided"
        )
    
    registry_service = RegistryLibraryService()
    
    criteria = {}
    if name:
        criteria["name"] = name
    if address:
        criteria["address"] = address
    
    result = registry_service.search_registry(criteria)
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Failed to search Registry Library")
        )
    
    return result

@router.get("/registry-library/details/{registry_id}")
def registry_library_details(
    *,
    registry_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed information for a specific registry.
    """
    registry_service = RegistryLibraryService()
    
    result = registry_service.get_registry_details(registry_id)
    
    if not result.get("success", False):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Failed to get registry details")
        )
    
    return result
